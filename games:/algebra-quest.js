// Algebra Balance Quest Game Logic - Updated to match integer/fraction versions

const WIN_SCORE = 20;
const MAX_VALUE = 5; // Changed from DIFFICULTY_RANGE to MAX_VALUE

let gameState = {
    deck: [],
    discardPile: [],
    player1Hand: [],
    player2Hand: [],
    player1NewCard: null,
    player2NewCard: null,
    player1TotalPoints: 0,
    player2TotalPoints: 0,
    currentPlayer: 'player1',
    gamePhase: 'draw',
    selectedCardId: null,
    isCardSelected: false,
    round: 1,
    roundInProgress: true,
    gameMode: 'single',
    player1Name: 'Player 1',
    player2Name: 'Nugget',
    swappedSides: false,
    gameOver: false
};

// DOM Elements
const setupScreen = document.getElementById('setup-screen');
const gameArea = document.getElementById('game-area');
const deckArea = document.getElementById('deck-area');
const gameStatus = document.getElementById('game-status');
const scoreArea = document.getElementById('score-area');
const winMessageElement = document.getElementById('win-message');
const overallWinnerMessage = document.getElementById('overall-winner-message');

/* --- Algebra Logic --- */
function generateDeck() {
    let cards = [];
    
    // 1. Zero Cards (8 copies instead of 4)
    for(let i = 0; i < 8; i++) cards.push({x: 0, c: 0, id: Math.random().toString(36).substr(2, 9)});
    
    // 2. Pure x cards (ax + 0) - DOUBLE THE AMOUNT
    // x values from -MAX_VALUE to MAX_VALUE (excluding 0)
    for(let x = -MAX_VALUE; x <= MAX_VALUE; x++) {
        if(x === 0) continue;
        // 4 copies of each pure x card (was 2)
        for(let i = 0; i < 4; i++) cards.push({x: x, c: 0, id: Math.random().toString(36).substr(2, 9)});
    }
    
    // 3. Pure constant cards (0x + b) - DOUBLE THE AMOUNT
    // c values from -MAX_VALUE to MAX_VALUE (excluding 0)
    for(let c = -MAX_VALUE; c <= MAX_VALUE; c++) {
        if(c === 0) continue;
        // 4 copies of each pure constant card (was 2)
        for(let i = 0; i < 4; i++) cards.push({x: 0, c: c, id: Math.random().toString(36).substr(2, 9)});
    }
    
    // 4. Mixed cards (ax + b) where both x and c are non-zero
    // Fewer of these to make balancing easier
    for(let x = -MAX_VALUE; x <= MAX_VALUE; x++) {
        if(x === 0) continue;
        for(let c = -MAX_VALUE; c <= MAX_VALUE; c++) {
            if(c === 0) continue;
            // 2 copies of each mixed card (reduced from 3)
            for(let i = 0; i < 2; i++) cards.push({x: x, c: c, id: Math.random().toString(36).substr(2, 9)});
        }
    }
    
    // Total cards: 
    // - 8 zeros
    // - 10 x values (-5 to -1, 1 to 5) × 4 copies = 40 pure x cards
    // - 10 c values (-5 to -1, 1 to 5) × 4 copies = 40 pure constant cards  
    // - 100 mixed combinations (10 x values × 10 c values) × 2 copies = 200 mixed cards
    // Total: 8 + 40 + 40 + 200 = 288 cards
    
    return cards.sort(() => Math.random() - 0.5);
}

function formatAlgebra(x, c) {
    if (x === 0 && c === 0) return "0";
    let str = "";
    if (x !== 0) {
        if (x === 1) str += "x"; 
        else if (x === -1) str += "-x"; 
        else str += x + "x";
    }
    if (c !== 0) {
        if (c > 0 && x !== 0) str += " + " + c;
        else if (c < 0 && x !== 0) str += " - " + Math.abs(c);
        else str += c;
    }
    return str;
}

/* --- Game Setup --- */
function initSetup() {
    // Game mode selection
    document.getElementById('single-player-btn').addEventListener('click', () => {
        setGameMode('single');
    });
    
    document.getElementById('two-player-btn').addEventListener('click', () => {
        setGameMode('twoPlayer');
    });
    
    document.getElementById('start-btn').addEventListener('click', startGame);
    
    // Control buttons
    document.getElementById('swap-sides-btn').addEventListener('click', swapSides);
    document.getElementById('new-game-btn').addEventListener('click', newGame);
    document.getElementById('next-round-btn').addEventListener('click', nextRound);
    document.getElementById('play-again-btn').addEventListener('click', newGame);
    
    setGameMode('single');
}

function setGameMode(mode) {
    const singleBtn = document.getElementById('single-player-btn');
    const twoBtn = document.getElementById('two-player-btn');
    const player2Input = document.getElementById('player2-name');
    
    singleBtn.classList.toggle('active', mode === 'single');
    twoBtn.classList.toggle('active', mode === 'twoPlayer');
    gameState.gameMode = mode;
    
    if (mode === 'single') {
        player2Input.value = 'Nugget';
        player2Input.disabled = true;
        player2Input.placeholder = 'AI Helper';
    } else {
        player2Input.disabled = false;
        player2Input.value = 'Player 2';
        player2Input.placeholder = 'Player 2 Name';
    }
}

function startGame() {
    gameState.player1Name = document.getElementById('player1-name').value.trim() || 'Player 1';
    gameState.player2Name = document.getElementById('player2-name').value.trim() || 
                           (gameState.gameMode === 'single' ? 'Nugget' : 'Player 2');
    
    setupScreen.classList.add('hidden');
    gameArea.classList.remove('hidden');
    deckArea.classList.remove('hidden');
    gameStatus.classList.remove('hidden');
    scoreArea.classList.remove('hidden');
    
    const goalDisplay = document.getElementById('game-goal-display');
    goalDisplay.style.display = 'block';
    document.getElementById('win-target').textContent = WIN_SCORE;
    
    updatePlayerNames();
    initGame();
}

function updatePlayerNames() {
    // Update score area names (always show actual names)
    document.getElementById('score-player1-name').textContent = gameState.player1Name;
    document.getElementById('score-player2-name').textContent = gameState.player2Name;
    
    // Update display names based on swapped sides
    if (gameState.swappedSides) {
        // Player 1 appears on right, Player 2 on left (swap visual positions only)
        document.getElementById('player1-display-name').textContent = gameState.player2Name;
        document.getElementById('player2-display-name').textContent = gameState.player1Name;
    } else {
        // Player 1 appears on left, Player 2 on right (default)
        document.getElementById('player1-display-name').textContent = gameState.player1Name;
        document.getElementById('player2-display-name').textContent = gameState.player2Name;
    }
}

function swapSides() {
    gameState.swappedSides = !gameState.swappedSides;
    updatePlayerNames();
    updateUI();
    updateTurnIndicator();
}

/* --- Game Loop --- */
function initGame() {
    gameState.deck = generateDeck();
    gameState.discardPile = [gameState.deck.pop()];
    gameState.player1Hand = [];
    gameState.player2Hand = [];
    gameState.player1NewCard = null;
    gameState.player2NewCard = null;
    
    // Deal 5 cards
    for(let i = 0; i < 5; i++) {
        gameState.player1Hand.push(gameState.deck.pop());
        gameState.player2Hand.push(gameState.deck.pop());
    }
    
    gameState.gamePhase = 'draw';
    gameState.selectedCardId = null;
    gameState.isCardSelected = false;
    gameState.roundInProgress = true;
    gameState.gameOver = false;
    
    // Simplified turn management
    if (gameState.round === 1) {
        gameState.currentPlayer = gameState.gameMode === 'single' ? 'player1' : 
                                (Math.random() < 0.5 ? 'player1' : 'player2');
    } else {
        // Alternate turns between rounds
        gameState.currentPlayer = gameState.currentPlayer === 'player1' ? 'player2' : 'player1';
    }
    
    updateUI();
    updateTurnIndicator();
    updateStatusMessage();
    
    // Check for immediate win
    setTimeout(checkImmediateWin, 2000);
    
    // Start AI turn if needed
    if (gameState.roundInProgress && gameState.gameMode === 'single' && gameState.currentPlayer === 'player2') {
        setTimeout(aiTurn, 1000);
    }
}

function updateTurnIndicator() {
    // Show turn indicator based on current player and swapped sides
    const isLeftPlayerTurn = (gameState.currentPlayer === 'player1' && !gameState.swappedSides) || 
                           (gameState.currentPlayer === 'player2' && gameState.swappedSides);
    const isRightPlayerTurn = (gameState.currentPlayer === 'player2' && !gameState.swappedSides) || 
                            (gameState.currentPlayer === 'player1' && gameState.swappedSides);
    
    document.getElementById('player1-turn').classList.toggle('hidden', !isLeftPlayerTurn);
    document.getElementById('player2-turn').classList.toggle('hidden', !isRightPlayerTurn);
    
    // Update active/inactive states
    const player1Area = document.getElementById('player1-area');
    const player2Area = document.getElementById('player2-area');
    
    // Reset both areas first
    player1Area.classList.remove('active-turn', 'inactive-turn');
    player2Area.classList.remove('active-turn', 'inactive-turn');
    
    // Apply active to current player's area, inactive to other
    // inactive-turn doesn't change visuals (keeps normal colors), just for code consistency
    if (isLeftPlayerTurn) {
        player1Area.classList.add('active-turn');
        player2Area.classList.add('inactive-turn');
    } else {
        player2Area.classList.add('active-turn');
        player1Area.classList.add('inactive-turn');
    }
}

function updateStatusMessage() {
    const status = document.getElementById('status-message');
    const currentPlayerName = getCurrentPlayerDisplayName();
    
    if (gameState.gamePhase === 'draw') {
        status.textContent = `${currentPlayerName}'s turn - click Card Bag or Used Bowl`;
    } else {
        status.textContent = `${currentPlayerName}, select a card to discard (click to select, click again to discard).`;
    }
}

function getCurrentPlayerDisplayName() {
    const isLeftPlayerTurn = (gameState.currentPlayer === 'player1' && !gameState.swappedSides) || 
                           (gameState.currentPlayer === 'player2' && gameState.swappedSides);
    return isLeftPlayerTurn ? document.getElementById('player1-display-name').textContent : 
                              document.getElementById('player2-display-name').textContent;
}

/* --- Interaction --- */
function playerDraw(source) {
    const player = gameState.currentPlayer;
    
    // Prevent human from drawing during AI turn
    if(gameState.gameMode === 'single' && player === 'player2') return;
    if(gameState.gamePhase !== 'draw' || !gameState.roundInProgress || gameState.gameOver) return;

    let card;
    if(source === 'deck') {
        if(gameState.deck.length === 0) reshuffleDiscard();
        card = gameState.deck.pop();
    } else {
        if(gameState.discardPile.length === 0) return;
        card = gameState.discardPile.pop();
    }

    if (player === 'player1') {
        gameState.player1NewCard = card;
    } else {
        gameState.player2NewCard = card;
    }
    
    gameState.gamePhase = 'discard';
    gameState.selectedCardId = null;
    gameState.isCardSelected = false;
    
    updateUI();
    updateStatusMessage();
}

function handleCardClick(cardId) {
    const player = gameState.currentPlayer;
    if(gameState.gameMode === 'single' && player === 'player2') return;
    if(gameState.gamePhase !== 'discard') return;

    // Check if card belongs to current player
    const currentHand = player === 'player1' ? gameState.player1Hand : gameState.player2Hand;
    const currentNewCard = player === 'player1' ? gameState.player1NewCard : gameState.player2NewCard;
    
    let ownsCard = currentHand.find(c => c.id === cardId);
    if(!ownsCard && currentNewCard && currentNewCard.id === cardId) {
        ownsCard = currentNewCard;
    }
    
    if(!ownsCard) return;

    if (gameState.selectedCardId === cardId && gameState.isCardSelected) {
        executeDiscard(cardId, player);
    } else {
        gameState.selectedCardId = cardId;
        gameState.isCardSelected = true;
        updateUI();
        updateStatusMessage();
    }
}

function executeDiscard(cardId, playerKey) {
    let hand = playerKey === 'player1' ? gameState.player1Hand : gameState.player2Hand;
    let newCard = playerKey === 'player1' ? gameState.player1NewCard : gameState.player2NewCard;
    
    let cardIndex = hand.findIndex(c => c.id === cardId);
    let isNewCard = false;
    let discardedCard;
    
    if (cardIndex !== -1) {
        // Discard from hand
        discardedCard = hand.splice(cardIndex, 1)[0];
    } else if (newCard && newCard.id === cardId) {
        // Discard the new card
        discardedCard = newCard;
        isNewCard = true;
        if (playerKey === 'player1') {
            gameState.player1NewCard = null;
        } else {
            gameState.player2NewCard = null;
        }
    } else {
        return; // Card not found
    }
    
    // If we had a new card and didn't discard it, add it to hand
    if (!isNewCard && newCard) {
        hand.push(newCard);
        if (playerKey === 'player1') {
            gameState.player1NewCard = null;
        } else {
            gameState.player2NewCard = null;
        }
    }
    
    gameState.discardPile.push(discardedCard);
    gameState.selectedCardId = null;
    gameState.isCardSelected = false;

    // Check if round end (Did current player win?)
    if(checkBalance(playerKey)) {
        handleRoundEnd(playerKey);
        return;
    }

    // Switch Turn
    if(playerKey === 'player1') {
        gameState.currentPlayer = 'player2';
        gameState.gamePhase = 'draw';
        if(gameState.gameMode === 'single') {
            updateStatusMessage();
            updateUI();
            setTimeout(aiTurn, 1000);
        } else {
            updateStatusMessage();
            updateUI();
        }
    } else {
        gameState.currentPlayer = 'player1';
        gameState.gamePhase = 'draw';
        updateStatusMessage();
        updateUI();
    }
}

/* --- AI --- */
function aiTurn() {
    if(gameState.gameMode !== 'single') return;

    let currentError = calculateError(gameState.player2Hand);
    
    // Check Discard
    let topDiscard = gameState.discardPile.length > 0 ? gameState.discardPile[gameState.discardPile.length - 1] : null;
    let bestMove = 'deck';
    
    if (topDiscard) {
        let tempHand = [...gameState.player2Hand, topDiscard];
        let bestErr = 999;
        for(let i = 0; i < tempHand.length; i++) {
            let err = calculateError(tempHand.filter((_, idx) => idx !== i));
            if(err < bestErr) bestErr = err;
        }
        if (bestErr < currentError) bestMove = 'discard';
    }

    // Draw
    let newCard;
    if(bestMove === 'discard') {
        newCard = gameState.discardPile.pop();
    } else {
        if(gameState.deck.length === 0) reshuffleDiscard();
        newCard = gameState.deck.pop();
    }
    
    gameState.player2NewCard = newCard;
    gameState.gamePhase = 'discard';
    updateUI();
    updateStatusMessage();

    setTimeout(() => {
        // Discard
        let bestDiscardId = null;
        let minError = 999;
        
        // Check hand cards
        for(let i = 0; i < gameState.player2Hand.length; i++) {
            let c = gameState.player2Hand[i];
            let err = calculateError(gameState.player2Hand.filter(x => x.id !== c.id));
            if(err < minError) { minError = err; bestDiscardId = c.id; }
        }
        
        // Check new card
        if (gameState.player2NewCard) {
            let err = calculateError(gameState.player2Hand); // Keep hand, discard new card
            if(err < minError) { minError = err; bestDiscardId = gameState.player2NewCard.id; }
        }
        
        executeDiscard(bestDiscardId, 'player2');
    }, 1500);
}

function calculateError(hand) {
    let xSum = 0, cSum = 0;
    hand.forEach(c => { xSum += c.x; cSum += c.c; });
    return Math.abs(xSum) + Math.abs(cSum);
}

function checkBalance(playerKey) {
    let hand = playerKey === 'player1' ? gameState.player1Hand : gameState.player2Hand;
    if(hand.length === 0) return false;
    let xSum = 0, cSum = 0;
    hand.forEach(c => { xSum += c.x; cSum += c.c; });
    return (xSum === 0 && cSum === 0);
}

function reshuffleDiscard() {
    if(gameState.discardPile.length <= 1) return;
    let top = gameState.discardPile.pop();
    gameState.deck = gameState.discardPile.sort(() => Math.random() - 0.5);
    gameState.discardPile = [top];
}

function checkImmediateWin() {
    if (!gameState.roundInProgress) return;
    
    const p1Balanced = checkBalance('player1');
    const p2Balanced = checkBalance('player2');
    
    if (p1Balanced && p2Balanced) {
        endRoundWithDelay('both');
    } else if (p1Balanced) {
        endRoundWithDelay('player1');
    } else if (p2Balanced) {
        endRoundWithDelay('player2');
    }
}

function endRoundWithDelay(winner) {
    setTimeout(() => {
        if (gameState.roundInProgress) handleRoundEnd(winner);
    }, 2000);
}

/* --- End & UI --- */
function handleRoundEnd(winnerKey) {
    gameState.roundInProgress = false;
    
    let loserKey = winnerKey === 'player1' ? 'player2' : 'player1';
    let loserHand = loserKey === 'player1' ? gameState.player1Hand : gameState.player2Hand;
    
    let xErr = 0, cErr = 0;
    loserHand.forEach(c => { xErr += c.x; cErr += c.c; });
    
    let score = Math.abs(xErr) + Math.abs(cErr);
    
    if (winnerKey === 'player1') {
        gameState.player1TotalPoints += score;
    } else if (winnerKey === 'player2') {
        gameState.player2TotalPoints += score;
    } else if (winnerKey === 'both') {
        gameState.player1TotalPoints += score;
        gameState.player2TotalPoints += score;
    }
    
    updateUI();

    let winnerName = winnerKey === 'player1' ? gameState.player1Name : gameState.player2Name;
    let title = winnerKey === 'both' ? 'Both Players Balanced!' : `${winnerName} Balanced!`;
    
    document.getElementById('win-title').textContent = title;
    if (winnerKey === 'both') {
        document.getElementById('win-details').textContent = `Both players collect ${score} points!`;
    } else {
        document.getElementById('win-details').textContent = `${winnerName} collects ${score} points!`;
    }
    winMessageElement.classList.remove('hidden');
    
    setTimeout(checkOverallWinner, 1000);
}

function checkOverallWinner() {
    const title = document.getElementById('overall-winner-title');
    const details = document.getElementById('overall-winner-details');
    
    if (gameState.player1TotalPoints >= WIN_SCORE && 
        gameState.player2TotalPoints >= WIN_SCORE) {
        title.textContent = "🏆 It's a Tie! 🏆";
        details.textContent = `Both players reached ${WIN_SCORE} points! ${gameState.player1Name}: ${gameState.player1TotalPoints} points, ${gameState.player2Name}: ${gameState.player2TotalPoints} points`;
        gameState.gameOver = true;
        overallWinnerMessage.classList.remove('hidden');
        winMessageElement.classList.add('hidden');
    } else if (gameState.player1TotalPoints >= WIN_SCORE) {
        showOverallWinner('player1');
    } else if (gameState.player2TotalPoints >= WIN_SCORE) {
        showOverallWinner('player2');
    }
}

function showOverallWinner(winner) {
    gameState.gameOver = true;
    
    const title = document.getElementById('overall-winner-title');
    const details = document.getElementById('overall-winner-details');
    
    if (winner === 'player1') {
        title.textContent = `🏆 ${gameState.player1Name} Wins! 🏆`;
        details.textContent = `${gameState.player1Name} reached ${gameState.player1TotalPoints} points before ${gameState.player2Name} (${gameState.player2TotalPoints} points)!`;
    } else {
        title.textContent = `🏆 ${gameState.player2Name} Wins! 🏆`;
        details.textContent = `${gameState.player2Name} reached ${gameState.player2TotalPoints} points before ${gameState.player1Name} (${gameState.player1TotalPoints} points)!`;
    }
    
    overallWinnerMessage.classList.remove('hidden');
    winMessageElement.classList.add('hidden');
}

function nextRound() {
    if (gameState.gameOver) {
        newGame();
        return;
    }
    
    gameState.round++;
    winMessageElement.classList.add('hidden');
    initGame();
}

function newGame() {
    // Return to setup screen
    setupScreen.classList.remove('hidden');
    gameArea.classList.add('hidden');
    deckArea.classList.add('hidden');
    gameStatus.classList.add('hidden');
    scoreArea.classList.add('hidden');
    winMessageElement.classList.add('hidden');
    overallWinnerMessage.classList.add('hidden');
    document.getElementById('game-goal-display').style.display = 'none';
    
    // Reset some game state
    gameState.player1TotalPoints = 0;
    gameState.player2TotalPoints = 0;
    gameState.gameOver = false;
    gameState.round = 1;
    gameState.swappedSides = false;
    
    setGameMode(gameState.gameMode);
    updatePlayerNames();
}

function updateUI() {
    // FIXED: Cards and scales now swap correctly when sides are swapped
    const isLeftPlayerTurn = (gameState.currentPlayer === 'player1' && !gameState.swappedSides) || 
                           (gameState.currentPlayer === 'player2' && gameState.swappedSides);
    
    // Determine which player's actual data goes in which display area
    if (gameState.swappedSides) {
        // When sides are swapped:
        // - Left area (player1-area) displays Player 2's actual data
        // - Right area (player2-area) displays Player 1's actual data
        renderHand('player1', gameState.player2Hand, gameState.player2NewCard, 
                   gameState.currentPlayer === 'player2' && gameState.swappedSides);
        renderHand('player2', gameState.player1Hand, gameState.player1NewCard,
                   gameState.currentPlayer === 'player1' && gameState.swappedSides);
        
        // Update Scales - swapped
        updatePlayerScales('player1', gameState.player2Hand);
        updatePlayerScales('player2', gameState.player1Hand);
    } else {
        // Default: not swapped
        // - Left area (player1-area) displays Player 1's actual data
        // - Right area (player2-area) displays Player 2's actual data
        renderHand('player1', gameState.player1Hand, gameState.player1NewCard,
                   gameState.currentPlayer === 'player1' && !gameState.swappedSides);
        renderHand('player2', gameState.player2Hand, gameState.player2NewCard,
                   gameState.currentPlayer === 'player2' && !gameState.swappedSides);
        
        // Update Scales - normal
        updatePlayerScales('player1', gameState.player1Hand);
        updatePlayerScales('player2', gameState.player2Hand);
    }

    // Update Discard Pile
    let discardContainer = document.getElementById('discard-pile');
    if(gameState.discardPile.length > 0) {
        let top = gameState.discardPile[gameState.discardPile.length - 1];
        discardContainer.innerHTML = `<span class="card-algebra" style="font-size:1.3rem;">${formatAlgebra(top.x, top.c)}</span>`;
    } else {
        discardContainer.innerHTML = "";
    }

    // Update Scores - always show actual player scores
    document.getElementById('player1-score').textContent = gameState.player1TotalPoints;
    document.getElementById('player2-score').textContent = gameState.player2TotalPoints;
    document.getElementById('player1-total-score').textContent = gameState.player1TotalPoints;
    document.getElementById('player2-total-score').textContent = gameState.player2TotalPoints;
    document.getElementById('current-round').textContent = gameState.round;

    // Highlights for Active Turn
    const deckEl = document.getElementById('deck');
    const discardEl = document.getElementById('discard-pile');

    // Reset Styles
    deckEl.classList.remove('active-pile');
    discardEl.classList.remove('active-pile');

    // Apply Pile Highlights (only if human turn and draw phase)
    const isHumanTurn = (gameState.currentPlayer === 'player1') || (gameState.gameMode === 'twoPlayer' && gameState.currentPlayer === 'player2');
    if (isHumanTurn && gameState.gamePhase === 'draw') {
         deckEl.classList.add('active-pile');
         if(gameState.discardPile.length > 0) discardEl.classList.add('active-pile');
    }
}

function updatePlayerScales(displayKey, hand) {
    let xSum = 0, cSum = 0;
    hand.forEach(c => { xSum += c.x; cSum += c.c; });
    
    updateScale(`${displayKey}-scale-x`, xSum, `${displayKey}-bal-x`, true);
    updateScale(`${displayKey}-scale-c`, cSum, `${displayKey}-bal-c`, false);
}

function renderHand(displayKey, hand, newCard, isCurrentPlayer) {
    let container = document.getElementById(`${displayKey}-hand`);
    container.innerHTML = "";
    
    // Render main hand
    hand.forEach((card) => {
        let div = document.createElement('div');
        div.className = "card";
        
        // Interaction Check
        let isInteractive = false;
        if(isCurrentPlayer && gameState.gamePhase === 'discard') {
            isInteractive = true;
        }

        if (isInteractive) {
            div.classList.add('interactive');
            if (card.id === gameState.selectedCardId) div.classList.add('selected');
            div.onclick = () => handleCardClick(card.id);
        }
        
        div.innerHTML = `<span class="card-algebra">${formatAlgebra(card.x, card.c)}</span>`;
        container.appendChild(div);
    });
    
    // Render new card if exists
    if (newCard && isCurrentPlayer) {
        let newCardDiv = document.createElement('div');
        newCardDiv.className = "card new-card";
        
        if (isCurrentPlayer && gameState.gamePhase === 'discard') {
            newCardDiv.classList.add('interactive');
            if (newCard.id === gameState.selectedCardId) newCardDiv.classList.add('selected');
            newCardDiv.onclick = () => handleCardClick(newCard.id);
        }
        
        newCardDiv.innerHTML = `<span class="card-algebra">${formatAlgebra(newCard.x, newCard.c)}</span>`;
        container.appendChild(newCardDiv);
    }
}

function updateScale(elementId, val, textId, isX) {
    let rotation = Math.max(-20, Math.min(20, val * 3)); 
    document.getElementById(elementId).style.transform = `rotate(${rotation}deg)`;
    let text = isX ? val + "x" : val;
    let el = document.getElementById(textId);
    el.innerText = text;
    if(val === 0) { 
        el.style.background = "#4caf50"; 
        el.style.color = "white"; 
    } else { 
        el.style.background = "rgba(255, 152, 0, 0.9)"; 
        el.style.color = "white"; 
    }
}

// Event listeners for deck and discard
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('deck').addEventListener('click', () => playerDraw('deck'));
    document.getElementById('discard-pile').addEventListener('click', () => playerDraw('discard'));
    initSetup();
});