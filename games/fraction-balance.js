// Fraction Balance Quest Game Logic

// Define fractions for the fraction version
const FRACTIONS = [
    // 0 (5 copies will be added)
    {numerator: 0, denominator: 1, value: 0, twelfths: 0},
    // ±1
    {numerator: 1, denominator: 1, value: 1, twelfths: 12},
    {numerator: -1, denominator: 1, value: -1, twelfths: -12},
    // ±1/2
    {numerator: 1, denominator: 2, value: 0.5, twelfths: 6},
    {numerator: -1, denominator: 2, value: -0.5, twelfths: -6},
    // ±1/3
    {numerator: 1, denominator: 3, value: 1/3, twelfths: 4},
    {numerator: -1, denominator: 3, value: -1/3, twelfths: -4},
    // ±2/3
    {numerator: 2, denominator: 3, value: 2/3, twelfths: 8},
    {numerator: -2, denominator: 3, value: -2/3, twelfths: -8},
    // ±1/4
    {numerator: 1, denominator: 4, value: 0.25, twelfths: 3},
    {numerator: -1, denominator: 4, value: -0.25, twelfths: -3},
    // ±3/4
    {numerator: 3, denominator: 4, value: 0.75, twelfths: 9},
    {numerator: -3, denominator: 4, value: -0.75, twelfths: -9},
    // ±1/6
    {numerator: 1, denominator: 6, value: 1/6, twelfths: 2},
    {numerator: -1, denominator: 6, value: -1/6, twelfths: -2},
    // ±5/6
    {numerator: 5, denominator: 6, value: 5/6, twelfths: 10},
    {numerator: -5, denominator: 6, value: -5/6, twelfths: -10},
    // ±1/12
    {numerator: 1, denominator: 12, value: 1/12, twelfths: 1},
    {numerator: -1, denominator: 12, value: -1/12, twelfths: -1},
    // ±5/12
    {numerator: 5, denominator: 12, value: 5/12, twelfths: 5},
    {numerator: -5, denominator: 12, value: -5/12, twelfths: -5},
    // ±7/12
    {numerator: 7, denominator: 12, value: 7/12, twelfths: 7},
    {numerator: -7, denominator: 12, value: -7/12, twelfths: -7},
    // ±11/12
    {numerator: 11, denominator: 12, value: 11/12, twelfths: 11},
    {numerator: -11, denominator: 12, value: -11/12, twelfths: -11}
];

// Game state
const gameState = {
    deck: [],
    discardPile: [],
    player1Hand: [],
    player2Hand: [],
    player1NewCard: null,
    player2NewCard: null,
    player1TotalTreats: 0,
    player2TotalTreats: 0,
    currentPlayer: 'player1',
    gamePhase: 'draw',
    selectedCardIndex: null,
    selectedCardIsNew: false,
    isCardSelected: false,
    round: 1,
    showBalance: true,
    roundInProgress: true,
    gameMode: 'single',
    player1Name: 'Player 1',
    player2Name: 'AI',
    swappedSides: false,
    winCondition: 20,
    gameOver: false,
    gameType: 'fractions' // Always 'fractions' for this version
};

// DOM Elements
const setupScreen = document.getElementById('setup-screen');
const gameArea = document.getElementById('game-area');
const deckArea = document.getElementById('deck-area');
const gameStatus = document.getElementById('game-status');
const scoreArea = document.getElementById('score-area');
const winMessageElement = document.getElementById('win-message');
const overallWinnerMessage = document.getElementById('overall-winner-message');

// Initialize setup
function initSetup() {
    // Game mode selection
    document.getElementById('single-player-btn').addEventListener('click', () => {
        setGameMode('single');
    });
    
    document.getElementById('two-player-btn').addEventListener('click', () => {
        setGameMode('twoPlayer');
    });
    
    // Win condition selection
    document.querySelectorAll('.win-condition-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.win-condition-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            gameState.winCondition = parseInt(option.getAttribute('data-value'));
            option.querySelector('.win-condition-radio').checked = true;
        });
    });
    
    document.querySelector('.win-condition-option').click();
    document.getElementById('start-btn').addEventListener('click', startGame);
    
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
        player2Input.value = 'AI';
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
                           (gameState.gameMode === 'single' ? 'AI' : 'Player 2');
    
    setupScreen.classList.add('hidden');
    gameArea.classList.remove('hidden');
    deckArea.classList.remove('hidden');
    gameStatus.classList.remove('hidden');
    scoreArea.classList.remove('hidden');
    
    const goalDisplay = document.getElementById('game-goal-display');
    if (gameState.winCondition > 0) {
        goalDisplay.style.display = 'block';
        document.getElementById('win-target').textContent = gameState.winCondition;
    } else {
        goalDisplay.style.display = 'none';
    }
    
    updatePlayerNames();
    initGame();
}

function updatePlayerNames() {
    // Always show Player 1's name in Player 1's score area
    document.getElementById('score-player1-name').textContent = gameState.player1Name;
    document.getElementById('score-player2-name').textContent = gameState.player2Name;
    
    // Update display names based on swapped sides
    if (gameState.swappedSides) {
        // Player 1 appears on right, Player 2 on left
        document.getElementById('left-player-display-name').textContent = gameState.player2Name;
        document.getElementById('right-player-display-name').textContent = gameState.player1Name;
    } else {
        // Player 1 appears on left, Player 2 on right (default)
        document.getElementById('left-player-display-name').textContent = gameState.player1Name;
        document.getElementById('right-player-display-name').textContent = gameState.player2Name;
    }
}

function swapSides() {
    gameState.swappedSides = !gameState.swappedSides;
    updatePlayerNames();
    updateUI();
    updateTurnIndicator();
    updateNumberLines();
}

function initGame() {
    // Initialize deck for fractions
    gameState.deck = [];
    
    // First, add 5 copies of 0
    for (let i = 0; i < 5; i++) {
        gameState.deck.push({numerator: 0, denominator: 1, value: 0, twelfths: 0});
    }
    
    // Then add 5 copies of each other fraction
    for (let i = 0; i < 5; i++) {
        // Skip the 0 fraction in the FRACTIONS array since we already added it
        FRACTIONS.slice(1).forEach(fraction => {
            gameState.deck.push({...fraction});
        });
    }
    
    shuffleArray(gameState.deck);
    
    gameState.discardPile = [gameState.deck.pop()];
    gameState.player1Hand = [];
    gameState.player2Hand = [];
    gameState.player1NewCard = null;
    gameState.player2NewCard = null;
    // DON'T reset total treats here - they should accumulate between rounds
    
    // Deal 5 cards to each player
    for (let i = 0; i < 5; i++) {
        gameState.player1Hand.push(gameState.deck.pop());
        gameState.player2Hand.push(gameState.deck.pop());
    }
    
    gameState.gamePhase = 'draw';
    gameState.selectedCardIndex = null;
    gameState.selectedCardIsNew = false;
    gameState.isCardSelected = false;
    gameState.roundInProgress = true;
    gameState.gameOver = false;
    
    // Simplified turn management - alternate between rounds
    if (gameState.round === 1) {
        gameState.currentPlayer = gameState.gameMode === 'single' ? 'player1' : 
                                (Math.random() < 0.5 ? 'player1' : 'player2');
    } else {
        // Alternate turns between rounds
        gameState.currentPlayer = gameState.currentPlayer === 'player1' ? 'player2' : 'player1';
    }
    
    // Initialize balance display
    const toggleBtn = document.getElementById('toggle-balance-btn');
    if (gameState.showBalance) {
        toggleBtn.textContent = 'Hide Balance';
        document.getElementById('left-player-net-balance').style.display = 'block';
        document.getElementById('right-player-net-balance').style.display = 'block';
    } else {
        toggleBtn.textContent = 'Show Balance';
        document.getElementById('left-player-net-balance').style.display = 'none';
        document.getElementById('right-player-net-balance').style.display = 'none';
    }
    
    updateUI();
    updateTurnIndicator();
    updateNumberLines();
    
    // Check for immediate win
    setTimeout(checkImmediateWin, 2000);
    
    // Start AI turn if needed
    if (gameState.roundInProgress && gameState.gameMode === 'single' && gameState.currentPlayer === 'player2') {
        document.getElementById('status-message').textContent = "AI is thinking...";
        setTimeout(aiTurn, 1000);
    } else {
        updateStatusMessage();
    }
}

function updateNumberLines() {
    const leftWrapper = document.getElementById('left-player-number-line-wrapper');
    const rightWrapper = document.getElementById('right-player-number-line-wrapper');
    
    // Clear existing treats
    const leftTreats = leftWrapper.querySelectorAll('.treat-stack');
    const rightTreats = rightWrapper.querySelectorAll('.treat-stack');
    leftTreats.forEach(t => t.remove());
    rightTreats.forEach(t => t.remove());
    
    // Create number ticks if they don't exist
    if (!leftWrapper.querySelector('.number-ticks')) {
        createNumberTicks(leftWrapper);
    }
    if (!rightWrapper.querySelector('.number-ticks')) {
        createNumberTicks(rightWrapper);
    }
    
    // Determine which hand goes where based on swapped sides
    const leftHand = gameState.swappedSides ? gameState.player2Hand : gameState.player1Hand;
    const rightHand = gameState.swappedSides ? gameState.player1Hand : gameState.player2Hand;
    
    const leftTwelfths = calculateHandTwelfths(leftHand);
    const rightTwelfths = calculateHandTwelfths(rightHand);
    const leftSum = calculateHandSum(leftHand);
    const rightSum = calculateHandSum(rightHand);
    
    // Place treats on number lines
    placeTreatsOnNumberLine(leftWrapper, leftHand);
    placeTreatsOnNumberLine(rightWrapper, rightHand);
    
    const leftNetBalance = document.getElementById('left-player-net-balance');
    const rightNetBalance = document.getElementById('right-player-net-balance');
    
    // Format the net balance display
    leftNetBalance.textContent = `Net: ${formatFraction(leftSum)}`;
    rightNetBalance.textContent = `Net: ${formatFraction(rightSum)}`;
    
    if (gameState.showBalance) {
        leftNetBalance.style.display = 'block';
        rightNetBalance.style.display = 'block';
        
        // Calculate tilt based on twelfths
        let tiltLeft = Math.max(Math.min(leftTwelfths, 15), -15);
        let tiltRight = Math.max(Math.min(rightTwelfths, 15), -15);
        
        // Apply tilt to the wrapper
        leftWrapper.style.transform = `rotate(${tiltLeft}deg)`;
        rightWrapper.style.transform = `rotate(${tiltRight}deg)`;
        
        leftWrapper.classList.toggle('balance-tilt', Math.abs(tiltLeft) > 0.5);
        rightWrapper.classList.toggle('balance-tilt', Math.abs(tiltRight) > 0.5);
    } else {
        leftNetBalance.style.display = 'none';
        rightNetBalance.style.display = 'none';
        leftWrapper.style.transform = 'rotate(0deg)';
        rightWrapper.style.transform = 'rotate(0deg)';
        leftWrapper.classList.remove('balance-tilt');
        rightWrapper.classList.remove('balance-tilt');
    }
}

function createNumberTicks(wrapperElement) {
    const ticksContainer = document.createElement('div');
    ticksContainer.className = 'number-ticks';
    
    // 25 ticks for -1 to +1 (in 1/12 increments)
    for (let i = 0; i <= 24; i++) {
        const tick = document.createElement('div');
        // Major ticks at every 6/12 (0.5 intervals) and at 0
        const isMajor = i % 6 === 0 || i === 12;
        tick.className = isMajor ? 'tick major' : 'tick';
        tick.style.left = `${(i / 24) * 100}%`;
        ticksContainer.appendChild(tick);
    }
    
    wrapperElement.appendChild(ticksContainer);
}

function placeTreatsOnNumberLine(wrapperElement, hand) {
    // Fraction version
    const fractionCounts = {};
    hand.forEach(fraction => {
        const key = `${fraction.numerator}/${fraction.denominator}`;
        fractionCounts[key] = (fractionCounts[key] || {fraction, count: 0});
        fractionCounts[key].count++;
    });
    
    Object.values(fractionCounts).forEach(({fraction, count}) => {
        const value = fraction.value;
        
        // Position from 2.5% to 97.5% (0 = -1, 24 = +1)
        const position = 2.5 + ((value + 1) * (95 / 2));
        
        const stackContainer = document.createElement('div');
        stackContainer.className = 'treat-stack';
        stackContainer.style.left = `${position}%`;
        stackContainer.style.bottom = '0px';
        stackContainer.title = `Position: ${formatFraction(value)} (${count} nut${count !== 1 ? 's' : ''})`;
        
        const STACK_SPACING = 18;
        
        for (let i = 0; i < count; i++) {
            const treat = document.createElement('div');
            treat.className = 'treat-in-stack';
            treat.textContent = '🌰';
            treat.style.color = value > 0 ? '#8d6e63' : value < 0 ? '#5d4037' : '#ff9800';
            treat.style.fontSize = '1.6rem';
            
            const verticalOffset = -(i * STACK_SPACING);
            treat.style.transform = `translate(-50%, ${verticalOffset}px)`;
            treat.style.zIndex = (count - i).toString();
            
            stackContainer.appendChild(treat);
        }
        
        wrapperElement.appendChild(stackContainer);
    });
}

function toggleBalance() {
    gameState.showBalance = !gameState.showBalance;
    document.getElementById('toggle-balance-btn').textContent = gameState.showBalance ? 'Hide Balance' : 'Show Balance';
    updateNumberLines();
}

function updateTurnIndicator() {
    // Show turn indicator based on current player and swapped sides
    const isLeftPlayerTurn = (gameState.currentPlayer === 'player1' && !gameState.swappedSides) || 
                           (gameState.currentPlayer === 'player2' && gameState.swappedSides);
    const isRightPlayerTurn = (gameState.currentPlayer === 'player2' && !gameState.swappedSides) || 
                            (gameState.currentPlayer === 'player1' && gameState.swappedSides);
    
    document.getElementById('left-player-turn').classList.toggle('hidden', !isLeftPlayerTurn);
    document.getElementById('right-player-turn').classList.toggle('hidden', !isRightPlayerTurn);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function calculateHandSum(hand) {
    return hand.reduce((sum, card) => sum + card.value, 0);
}

function calculateHandTwelfths(hand) {
    return hand.reduce((sum, card) => sum + card.twelfths, 0);
}

function formatFraction(value) {
    if (Math.abs(value) < 0.001) return '0';
    
    // Try to express as fraction with denominator 12
    const numerator = Math.round(value * 12);
    if (Math.abs(value * 12 - numerator) < 0.01) {
        if (Math.abs(numerator) === 12) return numerator > 0 ? '1' : '-1';
        if (Math.abs(numerator) === 6) return numerator > 0 ? '1/2' : '-1/2';
        if (Math.abs(numerator) === 4) return numerator > 0 ? '1/3' : '-1/3';
        if (Math.abs(numerator) === 8) return numerator > 0 ? '2/3' : '-2/3';
        if (Math.abs(numerator) === 3) return numerator > 0 ? '1/4' : '-1/4';
        if (Math.abs(numerator) === 9) return numerator > 0 ? '3/4' : '-3/4';
        if (Math.abs(numerator) === 2) return numerator > 0 ? '1/6' : '-1/6';
        if (Math.abs(numerator) === 10) return numerator > 0 ? '5/6' : '-5/6';
        
        // For other fractions with denominator 12
        const gcd = greatestCommonDivisor(Math.abs(numerator), 12);
        const simpleNum = numerator / gcd;
        const simpleDen = 12 / gcd;
        
        if (simpleDen === 1) return `${simpleNum}`;
        return `${simpleNum}/${simpleDen}`;
    }
    
    // Show as decimal with 2 places
    return value.toFixed(2);
}

function greatestCommonDivisor(a, b) {
    if (b === 0) return a;
    return greatestCommonDivisor(b, a % b);
}

function checkImmediateWin() {
    if (!gameState.roundInProgress) return;
    
    const p1Twelfths = calculateHandTwelfths(gameState.player1Hand);
    const p2Twelfths = calculateHandTwelfths(gameState.player2Hand);
    
    // Use integer comparison for exact zero
    if (p1Twelfths === 0 && p2Twelfths === 0) {
        endRoundWithDelay('both');
    } else if (p1Twelfths === 0) {
        endRoundWithDelay('player1');
    } else if (p2Twelfths === 0) {
        endRoundWithDelay('player2');
    }
}

function endRoundWithDelay(winner) {
    gameState.showBalance = true;
    updateNumberLines();
    
    setTimeout(() => {
        if (gameState.roundInProgress) endRound(winner);
    }, 2000);
}

function getCurrentPlayerHand() {
    return gameState.currentPlayer === 'player1' ? gameState.player1Hand : gameState.player2Hand;
}

function getCurrentPlayerNewCard() {
    return gameState.currentPlayer === 'player1' ? gameState.player1NewCard : gameState.player2NewCard;
}

function setCurrentPlayerNewCard(card) {
    if (gameState.currentPlayer === 'player1') {
        gameState.player1NewCard = card;
    } else {
        gameState.player2NewCard = card;
    }
}

function getCurrentPlayerName() {
    const isLeftPlayer = (gameState.currentPlayer === 'player1' && !gameState.swappedSides) || 
                       (gameState.currentPlayer === 'player2' && gameState.swappedSides);
    return isLeftPlayer ? document.getElementById('left-player-display-name').textContent : 
                          document.getElementById('right-player-display-name').textContent;
}

function updateStatusMessage() {
    const status = document.getElementById('status-message');
    if (gameState.gamePhase === 'draw') {
        status.textContent = `${getCurrentPlayerName()}'s turn - click Treat Bag or Used Bowl`;
    } else {
        status.textContent = `${getCurrentPlayerName()}, select a fraction to discard (click once, then double-click).`;
    }
}

function currentPlayerDrawFromDeck() {
    if (gameState.gamePhase !== 'draw' || !gameState.roundInProgress || gameState.gameOver) return;
    
    if (gameState.deck.length === 0) {
        const topDiscard = gameState.discardPile.pop();
        gameState.deck = [...gameState.discardPile];
        shuffleArray(gameState.deck);
        gameState.discardPile = [topDiscard];
    }
    
    setCurrentPlayerNewCard(gameState.deck.pop());
    gameState.gamePhase = 'discard';
    gameState.isCardSelected = false;
    gameState.selectedCardIndex = null;
    gameState.selectedCardIsNew = false;
    
    updateUI();
    updateNumberLines();
    updateStatusMessage();
}

function currentPlayerTakeFromDiscard() {
    if (gameState.gamePhase !== 'draw' || !gameState.roundInProgress || gameState.gameOver) return;
    
    if (gameState.discardPile.length === 0) return;
    
    setCurrentPlayerNewCard(gameState.discardPile.pop());
    gameState.gamePhase = 'discard';
    gameState.isCardSelected = false;
    gameState.selectedCardIndex = null;
    gameState.selectedCardIsNew = false;
    
    updateUI();
    updateNumberLines();
    updateStatusMessage();
}

function selectCurrentPlayerCard(index, isNewCard = false) {
    if (gameState.gamePhase !== 'discard' || !gameState.roundInProgress || gameState.gameOver) return;
    
    if (gameState.selectedCardIndex === index && 
        gameState.selectedCardIsNew === isNewCard && 
        gameState.isCardSelected) {
        currentPlayerDiscardCard();
        return;
    }
    
    gameState.selectedCardIndex = index;
    gameState.selectedCardIsNew = isNewCard;
    gameState.isCardSelected = true;
    updateUI();
    
    document.getElementById('status-message').textContent = `${getCurrentPlayerName()}, fraction selected. Double-click to discard, or click another fraction.`;
}

function currentPlayerDiscardCard() {
    if (gameState.gamePhase !== 'discard' || 
        (gameState.selectedCardIndex === null && !gameState.selectedCardIsNew) || 
        !gameState.roundInProgress ||
        gameState.gameOver) return;
    
    const currentHand = getCurrentPlayerHand();
    const newCard = getCurrentPlayerNewCard();
    let discardedCard;
    
    if (gameState.selectedCardIsNew) {
        discardedCard = newCard;
        gameState.discardPile.push(discardedCard);
        setCurrentPlayerNewCard(null);
    } else {
        discardedCard = currentHand.splice(gameState.selectedCardIndex, 1)[0];
        gameState.discardPile.push(discardedCard);
        
        if (newCard !== null) {
            currentHand.push(newCard);
            setCurrentPlayerNewCard(null);
        }
    }
    
    gameState.selectedCardIndex = null;
    gameState.selectedCardIsNew = false;
    gameState.isCardSelected = false;
    
    // Check for win
    const currentTwelfths = calculateHandTwelfths(currentHand);
    
    // Use integer comparison for exact zero
    if (currentTwelfths === 0) {
        gameState.showBalance = true;
        updateNumberLines();
        setTimeout(() => {
            if (gameState.roundInProgress) endRound(gameState.currentPlayer);
        }, 2000);
        return;
    }
    
    // Switch turns
    if (gameState.gameMode === 'single' && gameState.currentPlayer === 'player1') {
        gameState.currentPlayer = 'player2';
        gameState.gamePhase = 'draw';
        updateUI();
        updateTurnIndicator();
        updateNumberLines();
        document.getElementById('status-message').textContent = "AI is thinking...";
        setTimeout(aiTurn, 1000);
    } else {
        gameState.currentPlayer = gameState.currentPlayer === 'player1' ? 'player2' : 'player1';
        gameState.gamePhase = 'draw';
        updateUI();
        updateTurnIndicator();
        updateNumberLines();
        updateStatusMessage();
    }
}

async function aiTurn() {
    if (gameState.currentPlayer !== 'player2' || !gameState.roundInProgress || gameState.gameOver) return;
    
    await delay(2000);
    
    const aiHand = gameState.player2Hand;
    const aiTwelfths = calculateHandTwelfths(aiHand);
    const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];
    
    let shouldTakeDiscard = false;
    let discardIndex = 0;
    
    if (topDiscard !== undefined) {
        let bestDiscardIndex = 0;
        // Calculate new balance using twelfths
        let bestNewTwelfths = aiTwelfths + topDiscard.twelfths - aiHand[0].twelfths;
        
        for (let i = 1; i < aiHand.length; i++) {
            const newTwelfths = aiTwelfths + topDiscard.twelfths - aiHand[i].twelfths;
            if (Math.abs(newTwelfths) < Math.abs(bestNewTwelfths)) {
                bestNewTwelfths = newTwelfths;
                bestDiscardIndex = i;
            }
        }
        
        if (Math.abs(bestNewTwelfths) < Math.abs(aiTwelfths)) {
            shouldTakeDiscard = true;
            discardIndex = bestDiscardIndex;
        }
    }
    
    if (shouldTakeDiscard && topDiscard !== undefined) {
        await delay(2000);
        
        gameState.player2NewCard = gameState.discardPile.pop();
        updateUI();
        
        await delay(2000);
        
        const discardedCard = aiHand.splice(discardIndex, 1)[0];
        gameState.discardPile.push(discardedCard);
        aiHand.push(gameState.player2NewCard);
        gameState.player2NewCard = null;
    } else {
        await delay(2000);
        
        if (gameState.deck.length === 0) {
            const topDiscard = gameState.discardPile.pop();
            gameState.deck = [...gameState.discardPile];
            shuffleArray(gameState.deck);
            gameState.discardPile = [topDiscard];
        }
        
        gameState.player2NewCard = gameState.deck.pop();
        updateUI();
        
        await delay(2000);
        
        let bestDiscardIndex = 0;
        // Calculate potential new hand with new card
        const potentialNewHand = [...aiHand, gameState.player2NewCard];
        const potentialTwelfths = calculateHandTwelfths(potentialNewHand);
        let bestTwelfths = potentialTwelfths - aiHand[0].twelfths;
        
        for (let i = 1; i < aiHand.length; i++) {
            const testTwelfths = potentialTwelfths - aiHand[i].twelfths;
            if (Math.abs(testTwelfths) < Math.abs(bestTwelfths)) {
                bestTwelfths = testTwelfths;
                bestDiscardIndex = i;
            }
        }
        
        await delay(2000);
        
        const discardedCard = aiHand.splice(bestDiscardIndex, 1)[0];
        gameState.discardPile.push(discardedCard);
        aiHand.push(gameState.player2NewCard);
        gameState.player2NewCard = null;
    }
    
    updateUI();
    updateNumberLines();
    
    // Check for win
    if (calculateHandTwelfths(gameState.player2Hand) === 0) {
        gameState.showBalance = true;
        updateNumberLines();
        setTimeout(() => {
            if (gameState.roundInProgress && !gameState.gameOver) endRound('player2');
        }, 2000);
        return;
    }
    
    gameState.currentPlayer = 'player1';
    gameState.gamePhase = 'draw';
    updateUI();
    updateTurnIndicator();
    document.getElementById('status-message').textContent = "AI finished. Your turn - click Treat Bag or Used Bowl.";
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function endRound(winner) {
    gameState.roundInProgress = false;
    
    let roundScore = 0;
    
    const p1Twelfths = calculateHandTwelfths(gameState.player1Hand);
    const p2Twelfths = calculateHandTwelfths(gameState.player2Hand);
    
    // Count nuts using integer calculation (twelfths)
    if (winner === 'player1' || winner === 'both') roundScore += Math.abs(p2Twelfths);
    if (winner === 'player2' || winner === 'both') roundScore += Math.abs(p1Twelfths);
    
    // Nuts are added correctly to the actual winner
    if (winner === 'player1') {
        gameState.player1TotalTreats += roundScore;
    } else if (winner === 'player2') {
        gameState.player2TotalTreats += roundScore;
    } else if (winner === 'both') {
        gameState.player1TotalTreats += roundScore;
        gameState.player2TotalTreats += roundScore;
    }
    
    updateUI();
    updateNumberLines();
    
    // Determine winner names - ALWAYS use actual player names, not display names
    let winnerName, opponentName;
    
    if (winner === 'player1') {
        winnerName = gameState.player1Name;
        opponentName = gameState.player2Name;
    } else if (winner === 'player2') {
        winnerName = gameState.player2Name;
        opponentName = gameState.player1Name;
    }
    
    document.getElementById('win-title').textContent = winner === 'both' ? 'Both Number Lines Balanced!' : 
                                                      `${winnerName} achieved perfect balance!`;
    
    const unit = roundScore === 1 ? 'nut' : 'nuts';
    
    if (winner === 'both') {
        document.getElementById('win-details').textContent = `Both players balanced perfectly! Each collects ${roundScore} ${unit} from the other!`;
    } else {
        document.getElementById('win-details').textContent = `${winnerName} collects ${roundScore} ${unit} from ${opponentName}!`;
    }
    
    winMessageElement.classList.remove('hidden');
    
    setTimeout(checkOverallWinner, 1000);
}

function checkOverallWinner() {
    if (gameState.winCondition === 0 || gameState.gameOver) return;
    
    const title = document.getElementById('overall-winner-title');
    const details = document.getElementById('overall-winner-details');
    
    if (gameState.player1TotalTreats >= gameState.winCondition && 
        gameState.player2TotalTreats >= gameState.winCondition) {
        title.textContent = "🏆 It's a Tie! 🏆";
        details.textContent = `Both players reached ${gameState.winCondition} nuts! ${gameState.player1Name}: ${gameState.player1TotalTreats} nuts, ${gameState.player2Name}: ${gameState.player2TotalTreats} nuts`;
        gameState.gameOver = true;
        overallWinnerMessage.classList.remove('hidden');
        winMessageElement.classList.add('hidden');
    } else if (gameState.player1TotalTreats >= gameState.winCondition) {
        showOverallWinner('player1');
    } else if (gameState.player2TotalTreats >= gameState.winCondition) {
        showOverallWinner('player2');
    }
}

function showOverallWinner(winner) {
    gameState.gameOver = true;
    
    const title = document.getElementById('overall-winner-title');
    const details = document.getElementById('overall-winner-details');
    
    // Use actual player names, not display names
    if (winner === 'player1') {
        title.textContent = `🏆 ${gameState.player1Name} Wins! 🏆`;
        details.textContent = `${gameState.player1Name} reached ${gameState.player1TotalTreats} nuts before ${gameState.player2Name} (${gameState.player2TotalTreats} nuts)!`;
    } else {
        title.textContent = `🏆 ${gameState.player2Name} Wins! 🏆`;
        details.textContent = `${gameState.player2Name} reached ${gameState.player2TotalTreats} nuts before ${gameState.player1Name} (${gameState.player1TotalTreats} nuts)!`;
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
    gameState.player1TotalTreats = 0;
    gameState.player2TotalTreats = 0;
    gameState.gameOver = false;
    gameState.round = 1;
    gameState.showBalance = true;
    gameState.swappedSides = false;
    
    document.getElementById('toggle-balance-btn').textContent = 'Hide Balance';
    document.getElementById('left-player-net-balance').style.display = 'none';
    document.getElementById('right-player-net-balance').style.display = 'none';
    
    setGameMode(gameState.gameMode);
    updatePlayerNames();
}

function renderHand(handElement, hand, newCard, isCurrentPlayer, isPlayer1) {
    handElement.innerHTML = '';
    
    const mainRow = document.createElement('div');
    mainRow.className = 'hand-row main-hand';
    
    hand.forEach((card, index) => {
        const cardElement = createCardElement(card, index, isCurrentPlayer, isPlayer1, false);
        mainRow.appendChild(cardElement);
    });
    
    handElement.appendChild(mainRow);
    
    if (newCard !== null && isCurrentPlayer) {
        const newCardContainer = document.createElement('div');
        newCardContainer.className = 'new-card-container';
        
        const indicator = document.createElement('div');
        indicator.className = 'new-card-indicator';
        indicator.textContent = 'New Fraction';
        newCardContainer.appendChild(indicator);
        
        const newCardElement = createCardElement(newCard, 0, isCurrentPlayer, isPlayer1, true);
        newCardContainer.appendChild(newCardElement);
        handElement.appendChild(newCardContainer);
    }
}

function createCardElement(card, index, isCurrentPlayer, isPlayer1, isNewCard) {
    const cardElement = document.createElement('div');
    const isSelected = gameState.selectedCardIndex === index && 
                     gameState.selectedCardIsNew === isNewCard && 
                     gameState.isCardSelected && 
                     isCurrentPlayer &&
                     gameState.gamePhase === 'discard';
    
    const value = card.value;
    const isZero = Math.abs(value) < 0.001;
    const isPositive = value > 0;
    
    cardElement.className = `card fraction-card ${isPlayer1 ? 'player-card' : 'opponent-card'} ${isPositive ? 'positive' : 'negative'} ${isSelected ? 'selected' : ''} ${isNewCard ? 'new-card' : ''} ${isZero ? 'zero' : ''}`;
    
    if (isZero) {
        cardElement.innerHTML = '<div class="fraction-zero">0</div>';
    } else {
        // Create a container that will center the entire fraction (including minus sign)
        const fractionContainer = document.createElement('div');
        fractionContainer.style.display = 'flex';
        fractionContainer.style.alignItems = 'center';
        fractionContainer.style.justifyContent = 'center';
        fractionContainer.style.width = '100%';
        fractionContainer.style.height = '100%';
        
        // Create a wrapper for the minus sign and the fraction
        const fractionWrapper = document.createElement('div');
        fractionWrapper.style.display = 'flex';
        fractionWrapper.style.alignItems = 'center';
        fractionWrapper.style.justifyContent = 'center';
        fractionWrapper.style.position = 'relative';
        
        if (card.numerator < 0) {
            const sign = document.createElement('div');
            sign.className = 'fraction-sign';
            sign.textContent = '−'; // Using minus sign instead of hyphen for better alignment
            sign.style.fontSize = '1.4rem';
            sign.style.marginRight = '3px';
            sign.style.lineHeight = '1';
            // Position the minus sign so its top aligns with the bottom of the fraction bar
            sign.style.position = 'relative';
            sign.style.top = '0.3em'; // Adjust this value to align with fraction bar
            fractionWrapper.appendChild(sign);
        }
        
        // Create the vertical fraction
        const verticalFraction = document.createElement('div');
        verticalFraction.style.display = 'flex';
        verticalFraction.style.flexDirection = 'column';
        verticalFraction.style.alignItems = 'center';
        verticalFraction.style.justifyContent = 'center';
        
        const numerator = document.createElement('div');
        numerator.className = 'fraction-numerator';
        numerator.textContent = Math.abs(card.numerator);
        numerator.style.fontSize = '1.1rem';
        numerator.style.lineHeight = '1';
        
        const denominator = document.createElement('div');
        denominator.className = 'fraction-denominator';
        denominator.textContent = card.denominator;
        denominator.style.fontSize = '1.1rem';
        denominator.style.lineHeight = '1';
        denominator.style.paddingTop = '1px';
        
        verticalFraction.appendChild(numerator);
        verticalFraction.appendChild(denominator);
        fractionWrapper.appendChild(verticalFraction);
        
        fractionContainer.appendChild(fractionWrapper);
        cardElement.appendChild(fractionContainer);
    }
    
    const treatElement = document.createElement('div');
    treatElement.className = 'card-treat';
    treatElement.textContent = '🌰';
    cardElement.appendChild(treatElement);
    
    if (isCurrentPlayer && gameState.gamePhase === 'discard' && gameState.roundInProgress && !gameState.gameOver) {
        cardElement.addEventListener('click', () => {
            selectCurrentPlayerCard(index, isNewCard);
        });
        
        cardElement.addEventListener('dblclick', () => {
            if (gameState.selectedCardIndex === index && gameState.selectedCardIsNew === isNewCard) {
                currentPlayerDiscardCard();
            }
        });
    }
    
    return cardElement;
}

function updateUI() {
    // Determine which player is currently on which side
    const isLeftPlayerCurrent = (gameState.currentPlayer === 'player1' && !gameState.swappedSides) || 
                              (gameState.currentPlayer === 'player2' && gameState.swappedSides);
    
    const leftHand = gameState.swappedSides ? gameState.player2Hand : gameState.player1Hand;
    const leftNewCard = gameState.swappedSides ? gameState.player2NewCard : gameState.player1NewCard;
    const leftIsPlayer1 = !gameState.swappedSides; // Left side shows Player 1 when not swapped
    
    renderHand(document.getElementById('left-player-hand'), leftHand, leftNewCard, isLeftPlayerCurrent, leftIsPlayer1);
    
    const rightHand = gameState.swappedSides ? gameState.player1Hand : gameState.player2Hand;
    const rightNewCard = gameState.swappedSides ? gameState.player1NewCard : gameState.player2NewCard;
    const rightIsPlayer1 = gameState.swappedSides; // Right side shows Player 1 when swapped
    
    renderHand(document.getElementById('right-player-hand'), rightHand, rightNewCard, !isLeftPlayerCurrent, rightIsPlayer1);
    
    // Update discard pile
    const discardPile = document.getElementById('discard-pile');
    discardPile.innerHTML = '';
    if (gameState.discardPile.length > 0) {
        const topCard = gameState.discardPile[gameState.discardPile.length - 1];
        const discardCardElement = createCardElement(topCard, 0, false, false, false);
        discardPile.appendChild(discardCardElement);
        discardPile.style.cursor = (gameState.gamePhase === 'draw' && gameState.roundInProgress && !gameState.gameOver) ? 'pointer' : 'default';
    }
    
    // Update deck
    document.getElementById('cards-remaining').textContent = gameState.deck.length;
    const drawPile = document.getElementById('draw-pile');
    if (gameState.gamePhase === 'draw' && gameState.roundInProgress && !gameState.gameOver) {
        drawPile.style.cursor = 'pointer';
        drawPile.style.opacity = '1';
    } else {
        drawPile.style.cursor = 'default';
        drawPile.style.opacity = '0.7';
    }
    
    // Update scores - use actual player scores
    const leftScore = gameState.swappedSides ? gameState.player2TotalTreats : gameState.player1TotalTreats;
    const rightScore = gameState.swappedSides ? gameState.player1TotalTreats : gameState.player2TotalTreats;
    
    document.getElementById('left-player-score').textContent = leftScore;
    document.getElementById('right-player-score').textContent = rightScore;
    document.getElementById('player1-total-score').textContent = gameState.player1TotalTreats;
    document.getElementById('player2-total-score').textContent = gameState.player2TotalTreats;
    document.getElementById('current-round').textContent = gameState.round;
    
    updateNumberLines();
}

// Event listeners
document.getElementById('draw-pile').addEventListener('click', currentPlayerDrawFromDeck);
document.getElementById('discard-pile').addEventListener('click', currentPlayerTakeFromDiscard);
document.getElementById('new-game-btn').addEventListener('click', newGame);
document.getElementById('toggle-balance-btn').addEventListener('click', toggleBalance);
document.getElementById('swap-sides-btn').addEventListener('click', swapSides);
document.getElementById('next-round-btn').addEventListener('click', nextRound);
document.getElementById('play-again-btn').addEventListener('click', newGame);

// Initialize
window.addEventListener('DOMContentLoaded', initSetup);