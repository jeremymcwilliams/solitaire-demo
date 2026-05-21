// LC Solitaire Game Logic

class SolitaireGame {
    constructor() {
        this.suits = ['spades', 'hearts', 'diamonds', 'clubs'];
        this.ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.suitSymbols = {
            spades: '♠',
            hearts: '♥',
            diamonds: '♦',
            clubs: '♣'
        };

        this.gameState = {
            deck: [],
            stock: [],
            waste: [],
            foundations: {
                spades: [],
                hearts: [],
                diamonds: [],
                clubs: []
            },
            tableau: [[], [], [], [], [], [], []],
            score: 0,
            sessionScore: 0,
            highScore: parseInt(localStorage.getItem('lcSolitaireHigh') || '0'),
            startTime: null,
            gameTime: 0,
            moveHistory: [],
            isGameWon: false
        };

        this.draggedCard = null;
        this.draggedCards = [];
        this.draggedFrom = null;
        this.timerInterval = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showScreen('start');
        this.updateHighScoreDisplay();
    }

    setupEventListeners() {
        // Start screen
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());

        // Game over modal
        document.getElementById('play-again-btn').addEventListener('click', () => this.playAgain());
        document.getElementById('quit-btn').addEventListener('click', () => this.quitGame());

        // Stock pile
        document.getElementById('stock-pile').addEventListener('click', () => this.drawFromStock());

        // Undo button
        document.getElementById('undo-btn').addEventListener('click', () => this.undo());

        // Double-click for auto-move to foundation
        document.addEventListener('dblclick', (e) => {
            if (e.target.classList.contains('card') && e.target.classList.contains('face-up')) {
                this.autoMoveToFoundation(e.target);
            }
        });
    }

    createDeck() {
        const deck = [];
        for (const suit of this.suits) {
            for (const rank of this.ranks) {
                deck.push({
                    suit,
                    rank,
                    color: (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black',
                    faceUp: false
                });
            }
        }
        return deck;
    }

    shuffleDeck(deck) {
        // Fisher-Yates shuffle algorithm
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    dealCards() {
        this.gameState.deck = this.shuffleDeck(this.createDeck());

        // Reset game state
        this.gameState.stock = [];
        this.gameState.waste = [];
        this.gameState.foundations = { spades: [], hearts: [], diamonds: [], clubs: [] };
        this.gameState.tableau = [[], [], [], [], [], [], []];
        this.gameState.moveHistory = [];
        this.gameState.isGameWon = false;

        let cardIndex = 0;

        // Deal tableau
        for (let col = 0; col < 7; col++) {
            for (let row = 0; row <= col; row++) {
                const card = this.gameState.deck[cardIndex++];
                card.faceUp = (row === col); // Only top card face up
                this.gameState.tableau[col].push(card);
            }
        }

        // Remaining cards go to stock
        this.gameState.stock = this.gameState.deck.slice(cardIndex);
    }

    startGame() {
        this.dealCards();
        this.gameState.score = 0;
        this.gameState.startTime = Date.now();
        this.gameTime = 0;

        this.startTimer();
        this.showScreen('game');
        this.renderGame();
    }

    playAgain() {
        this.gameState.sessionScore = this.gameState.score;
        this.hideModal();
        this.startGame();
    }

    quitGame() {
        this.hideModal();
        this.stopTimer();
        this.gameState.sessionScore = 0;
        this.gameState.score = 0;
        this.showScreen('start');
        this.updateHighScoreDisplay();
    }

    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(`${screenName}-screen`).classList.add('active');
    }

    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            this.gameTime = Date.now() - this.gameState.startTime;
            this.updateTimeDisplay();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimeDisplay() {
        const seconds = Math.floor(this.gameTime / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        document.getElementById('game-time').textContent = timeString;
    }

    updateScoreDisplay() {
        document.getElementById('current-score').textContent = this.gameState.score;
        document.getElementById('game-high-score').textContent = Math.max(this.gameState.highScore, this.gameState.sessionScore);
    }

    updateHighScoreDisplay() {
        const highScoreElement = document.getElementById('session-high-score');
        const highScoreValue = document.getElementById('high-score-value');

        if (this.gameState.highScore > 0) {
            highScoreValue.textContent = this.gameState.highScore;
            highScoreElement.classList.remove('hidden');
        } else {
            highScoreElement.classList.add('hidden');
        }
    }

    addScore(points, reason) {
        this.gameState.score = Math.max(0, this.gameState.score + points);
        this.updateScoreDisplay();

        // Save move for undo
        this.gameState.moveHistory.push({
            scoreChange: points,
            reason: reason,
            timestamp: Date.now()
        });

        console.log(`Score: ${points >= 0 ? '+' : ''}${points} (${reason})`);
    }

    renderGame() {
        this.renderTableau();
        this.renderStock();
        this.renderWaste();
        this.renderFoundations();
        this.updateScoreDisplay();
    }

    createCardElement(card) {
        const cardEl = document.createElement('div');
        cardEl.className = `card ${card.faceUp ? 'face-up' : 'face-down'} ${card.color}`;
        cardEl.dataset.suit = card.suit;
        cardEl.dataset.rank = card.rank;

        if (card.faceUp) {
            cardEl.innerHTML = `
                <div class="card-rank-top">${card.rank}${this.suitSymbols[card.suit]}</div>
                <div class="card-suit-center">${this.suitSymbols[card.suit]}</div>
                <div class="card-rank-bottom">${card.rank}${this.suitSymbols[card.suit]}</div>
            `;

            // Add drag event listeners
            cardEl.draggable = true;
            cardEl.addEventListener('dragstart', (e) => this.handleDragStart(e, card));
            cardEl.addEventListener('dragend', (e) => this.handleDragEnd(e));
        } else {
            // Face-down card click handler
            cardEl.addEventListener('click', () => this.flipCard(card));
        }

        return cardEl;
    }

    renderTableau() {
        for (let col = 0; col < 7; col++) {
            const columnEl = document.getElementById(`tableau-${col}`);
            columnEl.innerHTML = '';

            this.gameState.tableau[col].forEach((card, index) => {
                const cardEl = this.createCardElement(card);
                columnEl.appendChild(cardEl);
            });

            // Add drop listeners
            columnEl.addEventListener('dragover', (e) => this.handleDragOver(e));
            columnEl.addEventListener('drop', (e) => this.handleDrop(e, 'tableau', col));
        }
    }

    renderStock() {
        const stockEl = document.getElementById('stock-pile');
        stockEl.innerHTML = '';

        if (this.gameState.stock.length > 0) {
            const topCard = this.gameState.stock[this.gameState.stock.length - 1];
            const cardEl = this.createCardElement(topCard);
            stockEl.appendChild(cardEl);
        } else {
            stockEl.innerHTML = '<div class="pile-placeholder">↻</div>';
        }
    }

    renderWaste() {
        const wasteEl = document.getElementById('waste-pile');
        wasteEl.innerHTML = '';

        if (this.gameState.waste.length > 0) {
            const topCard = this.gameState.waste[this.gameState.waste.length - 1];
            topCard.faceUp = true;
            const cardEl = this.createCardElement(topCard);
            wasteEl.appendChild(cardEl);
        } else {
            wasteEl.innerHTML = '<div class="pile-placeholder">Waste</div>';
        }

        // Add drop listeners
        wasteEl.addEventListener('dragover', (e) => this.handleDragOver(e));
        wasteEl.addEventListener('drop', (e) => this.handleDrop(e, 'waste'));
    }

    renderFoundations() {
        for (const suit of this.suits) {
            const foundationEl = document.getElementById(`foundation-${suit}`);
            foundationEl.innerHTML = `<div class="pile-placeholder">${this.suitSymbols[suit]}</div>`;

            const foundation = this.gameState.foundations[suit];
            if (foundation.length > 0) {
                const topCard = foundation[foundation.length - 1];
                topCard.faceUp = true;
                const cardEl = this.createCardElement(topCard);
                foundationEl.appendChild(cardEl);
            }

            // Add drop listeners
            foundationEl.addEventListener('dragover', (e) => this.handleDragOver(e));
            foundationEl.addEventListener('drop', (e) => this.handleDrop(e, 'foundation', suit));
        }
    }

    drawFromStock() {
        if (this.gameState.stock.length > 0) {
            // Draw card from stock to waste
            const card = this.gameState.stock.pop();
            card.faceUp = true;
            this.gameState.waste.push(card);
        } else if (this.gameState.waste.length > 0) {
            // Recycle waste back to stock
            this.gameState.stock = this.gameState.waste.reverse();
            this.gameState.waste = [];
            this.gameState.stock.forEach(card => card.faceUp = false);
            this.addScore(-100, 'Stock recycled');
        }

        this.renderStock();
        this.renderWaste();
    }

    flipCard(card) {
        // Find card in tableau and flip if it's the top face-down card
        for (let col = 0; col < 7; col++) {
            const column = this.gameState.tableau[col];
            const cardIndex = column.indexOf(card);

            if (cardIndex !== -1 && cardIndex === column.length - 1 && !card.faceUp) {
                card.faceUp = true;
                this.addScore(5, 'Card revealed');
                this.renderTableau();
                break;
            }
        }
    }

    handleDragStart(e, card) {
        this.draggedCard = card;
        this.draggedCards = [card];

        // Find where the card is being dragged from
        this.draggedFrom = this.findCardLocation(card);

        // If dragging from tableau, include all face-up cards below
        if (this.draggedFrom.type === 'tableau') {
            const column = this.gameState.tableau[this.draggedFrom.index];
            const cardIndex = column.indexOf(card);
            this.draggedCards = column.slice(cardIndex);
        }

        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedCard = null;
        this.draggedCards = [];
        this.draggedFrom = null;

        // Remove drop target highlighting
        document.querySelectorAll('.drop-target').forEach(el => {
            el.classList.remove('drop-target');
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.target.closest('.tableau-column, .card-pile').classList.add('drop-target');
    }

    handleDrop(e, targetType, targetIndex) {
        e.preventDefault();
        e.target.closest('.tableau-column, .card-pile').classList.remove('drop-target');

        if (!this.draggedCard) return;

        if (this.canMoveTo(this.draggedCards, targetType, targetIndex)) {
            this.moveCards(this.draggedCards, this.draggedFrom, targetType, targetIndex);
            this.renderGame();
            this.checkWinCondition();
        } else {
            // Shake animation for invalid move
            e.target.closest('.tableau-column, .card-pile').classList.add('shake');
            setTimeout(() => {
                e.target.closest('.tableau-column, .card-pile').classList.remove('shake');
            }, 500);
        }
    }

    findCardLocation(card) {
        // Check waste
        if (this.gameState.waste.includes(card)) {
            return { type: 'waste' };
        }

        // Check tableau
        for (let i = 0; i < 7; i++) {
            if (this.gameState.tableau[i].includes(card)) {
                return { type: 'tableau', index: i };
            }
        }

        // Check foundations
        for (const suit of this.suits) {
            if (this.gameState.foundations[suit].includes(card)) {
                return { type: 'foundation', index: suit };
            }
        }

        return null;
    }

    canMoveTo(cards, targetType, targetIndex) {
        if (cards.length === 0) return false;

        const card = cards[0];

        if (targetType === 'foundation') {
            // Only single cards to foundation
            if (cards.length > 1) return false;

            const foundation = this.gameState.foundations[targetIndex];

            if (card.suit !== targetIndex) return false;

            if (foundation.length === 0) {
                return card.rank === 'A';
            } else {
                const topCard = foundation[foundation.length - 1];
                const cardValue = this.getCardValue(card.rank);
                const topValue = this.getCardValue(topCard.rank);
                return cardValue === topValue + 1;
            }
        }

        if (targetType === 'tableau') {
            const column = this.gameState.tableau[targetIndex];

            if (column.length === 0) {
                return card.rank === 'K';
            } else {
                const topCard = column[column.length - 1];
                if (!topCard.faceUp) return false;

                const cardValue = this.getCardValue(card.rank);
                const topValue = this.getCardValue(topCard.rank);

                return cardValue === topValue - 1 && card.color !== topCard.color;
            }
        }

        return false;
    }

    getCardValue(rank) {
        if (rank === 'A') return 1;
        if (rank === 'J') return 11;
        if (rank === 'Q') return 12;
        if (rank === 'K') return 13;
        return parseInt(rank);
    }

    moveCards(cards, from, toType, toIndex) {
        // Remove cards from source
        if (from.type === 'waste') {
            this.gameState.waste.pop();
        } else if (from.type === 'tableau') {
            this.gameState.tableau[from.index].splice(-cards.length);
        } else if (from.type === 'foundation') {
            this.gameState.foundations[from.index].pop();
        }

        // Add cards to destination
        if (toType === 'foundation') {
            this.gameState.foundations[toIndex].push(cards[0]);

            // Scoring for foundation moves
            if (from.type === 'tableau' || from.type === 'waste') {
                this.addScore(10, 'Card to foundation');
            }
        } else if (toType === 'tableau') {
            this.gameState.tableau[toIndex].push(...cards);

            // Scoring for tableau moves
            if (from.type === 'waste') {
                this.addScore(5, 'Stock card to tableau');
            } else if (from.type === 'foundation') {
                this.addScore(-15, 'Foundation card to tableau');
            }
        }

        // Auto-flip newly exposed cards
        if (from.type === 'tableau') {
            const column = this.gameState.tableau[from.index];
            if (column.length > 0) {
                const topCard = column[column.length - 1];
                if (!topCard.faceUp) {
                    topCard.faceUp = true;
                    this.addScore(5, 'Card revealed');
                }
            }
        }
    }

    autoMoveToFoundation(cardEl) {
        const suit = cardEl.dataset.suit;
        const rank = cardEl.dataset.rank;

        const card = { suit, rank, color: (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black' };
        const from = this.findCardLocation(card);

        if (this.canMoveTo([card], 'foundation', suit)) {
            this.moveCards([card], from, 'foundation', suit);
            this.renderGame();
            this.checkWinCondition();
        }
    }

    checkWinCondition() {
        const totalCards = Object.values(this.gameState.foundations).reduce((sum, pile) => sum + pile.length, 0);

        if (totalCards === 52) {
            this.gameState.isGameWon = true;
            this.stopTimer();

            // Update high score
            const finalScore = this.gameState.score + this.gameState.sessionScore;
            if (finalScore > this.gameState.highScore) {
                this.gameState.highScore = finalScore;
                localStorage.setItem('lcSolitaireHigh', this.gameState.highScore.toString());
            }

            this.showGameOverModal(true);
        }
    }

    showGameOverModal(won) {
        const modal = document.getElementById('game-over-modal');
        const title = document.getElementById('game-over-title');
        const message = document.getElementById('game-over-message');
        const finalScore = document.getElementById('final-score');
        const finalTime = document.getElementById('final-time');

        title.textContent = won ? 'Congratulations!' : 'Game Over';
        message.textContent = won ? 'You won the game!' : 'Better luck next time!';
        finalScore.textContent = this.gameState.score + this.gameState.sessionScore;

        const seconds = Math.floor(this.gameTime / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        finalTime.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;

        modal.classList.remove('hidden');
    }

    hideModal() {
        document.getElementById('game-over-modal').classList.add('hidden');
    }

    undo() {
        // Simple undo implementation
        if (this.gameState.moveHistory.length > 0) {
            const lastMove = this.gameState.moveHistory.pop();
            this.gameState.score = Math.max(0, this.gameState.score - lastMove.scoreChange);
            this.updateScoreDisplay();
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SolitaireGame();
});