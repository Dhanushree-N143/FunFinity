// Global Variables
let currentGame = null;
let gameScores = {
    'brainy-blitz': [],
    'word-warper': [],
    'blink-reaction': [],
    'serpent-sprint': [],
    'memory-mash': [],
    // New Games
    'typing-turbo': [],
    'color-craze': [],
    'number-ninja': [],
    'click-commando': []
};

// Load scores from localStorage
function loadScores() {
    const saved = localStorage.getItem('funfinity-scores');
    if (saved) {
        gameScores = JSON.parse(saved);
    }
}

// Save scores to localStorage
function saveScores() {
    localStorage.setItem('funfinity-scores', JSON.stringify(gameScores));
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadScores();
    initParticleSystem();
    updateLeaderboard();
    
    // Add click handlers for navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            showSection(target);
        });
    });

    // Automatically show home section on load
    showSection('home');
});

// Navigation Functions
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('section, .game-container').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
}

function startGame(gameId) {
    currentGame = gameId;
    showSection(gameId);
    
    // Initialize specific game
    switch(gameId) {
        case 'brainy-blitz':
            initQuizGame();
            break;
        case 'word-warper':
            initWordleGame();
            break;
        case 'blink-reaction':
            initReactionGame();
            break;
        case 'serpent-sprint':
            initSnakeGame();
            break;
        case 'memory-mash':
            initMemoryGame();
            break;
        case 'typing-turbo':
            initTypingGame();
            break;
        case 'color-craze':
            initColorGame();
            break;
        case 'number-ninja':
            initNumberGame();
            break;
        case 'click-commando':
            initClickGame();
            break;
    }
}

function backToGames() {
    showSection('games');
    currentGame = null;
    closeModal();
    // Stop any ongoing game loops/timers if applicable
}

function restartCurrentGame() {
    if (currentGame) {
        startGame(currentGame);
        closeModal();
    }
}

// Modal Functions
function showModal(title, score, isHighScore = false) {
    const modal = document.getElementById('game-over-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalScore = document.getElementById('modal-score');
    
    modalTitle.textContent = isHighScore ? 'New High Score!' : title;
    modalScore.textContent = `Your Score: ${score}`;
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('game-over-modal').classList.remove('active');
}

// Leaderboard Functions
function updateLeaderboard() {
    const content = document.getElementById('leaderboard-content');
    const activeTab = document.querySelector('.tab-button.active');
    const gameType = activeTab ? activeTab.textContent.toLowerCase().replace(/ /g, '-') : 'brainy-blitz';
    
    const scores = gameScores[gameType] || [];
    
    if (scores.length === 0) {
        content.innerHTML = `
            <div class="no-scores">
                <i class="fas fa-trophy"></i>
                <p>No scores yet! Be the first to play!</p>
            </div>
        `;
        return;
    }
    
    const sortedScores = scores.sort((a, b) => b.score - a.score).slice(0, 10);
    
    content.innerHTML = `
        <div class="leaderboard-list">
            ${sortedScores.map((entry, index) => `
                <div class="leaderboard-entry">
                    <span class="rank">#${index + 1}</span>
                    <span class="score">${entry.score}</span>
                    <span class="date">${new Date(entry.date).toLocaleDateString()}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function showLeaderboard(gameType) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    const buttonToActivate = Array.from(document.querySelectorAll('.tab-button')).find(btn => 
        btn.textContent.toLowerCase().replace(/ /g, '-') === gameType
    );
    if (buttonToActivate) {
        buttonToActivate.classList.add('active');
    }
    updateLeaderboard();
}

function addScore(gameType, score) {
    gameScores[gameType].push({
        score: score,
        date: new Date().toISOString()
    });
    saveScores();
    updateLeaderboard();
}

// Particle System
function initParticleSystem() {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 50;
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fill();
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// --- Quiz Game ---
let quizData = [
    {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correct: 2
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correct: 1
    },
    {
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correct: 1
    },
    {
        question: "Who painted the Mona Lisa?",
        options: ["Van Gogh", "Picasso", "Da Vinci", "Monet"],
        correct: 2
    },
    {
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        correct: 3
    },
    {
        question: "Which element has the chemical symbol 'O'?",
        options: ["Gold", "Oxygen", "Silver", "Iron"],
        correct: 1
    },
    {
        question: "What year did World War II end?",
        options: ["1944", "1945", "1946", "1947"],
        correct: 1
    },
    {
        question: "Which is the smallest country in the world?",
        options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
        correct: 1
    },
    {
        question: "What is the speed of light?",
        options: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"],
        correct: 0
    },
    {
        question: "Who wrote 'Romeo and Juliet'?",
        options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
        correct: 1
    }
];
let currentQuizQuestion = 0;
let quizScore = 0;
function initQuizGame() {
    currentQuizQuestion = 0;
    quizScore = 0;
    updateQuizDisplay();
    showQuizQuestion();
}
function updateQuizDisplay() {
    document.getElementById('quiz-score').textContent = quizScore;
    document.getElementById('quiz-question-num').textContent = currentQuizQuestion + 1;
    document.getElementById('quiz-progress').style.width = `${((currentQuizQuestion + 1) / quizData.length) * 100}%`;
}
function showQuizQuestion() {
    if (currentQuizQuestion >= quizData.length) {
        endQuizGame();
        return;
    }
    const question = quizData[currentQuizQuestion];
    document.getElementById('quiz-question').textContent = question.question;
    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;
        button.onclick = () => selectQuizAnswer(index);
        optionsContainer.appendChild(button);
    });
    updateQuizDisplay();
}
function selectQuizAnswer(selectedIndex) {
    const question = quizData[currentQuizQuestion];
    const buttons = document.querySelectorAll('.option-button');
    buttons.forEach((button, index) => {
        button.disabled = true;
        if (index === question.correct) {
            button.classList.add('correct');
        } else if (index === selectedIndex && index !== question.correct) {
            button.classList.add('incorrect');
        }
    });
    if (selectedIndex === question.correct) {
        quizScore += 10;
    }
    setTimeout(() => {
        currentQuizQuestion++;
        showQuizQuestion();
    }, 1500);
}
function endQuizGame() {
    addScore('brainy-blitz', quizScore);
    showModal('Quiz Complete!', quizScore);
}

// Wordle Game
const wordleWords = ['REACT', 'GAMES', 'MAGIC', 'POWER', 'LIGHT', 'SPACE', 'DREAM', 'HAPPY', 'WORLD', 'PEACE', 'PLANT', 'MOUSE', 'APPLE', 'CRANE', 'BLISS'];
let wordleTarget = '';
let wordleCurrentRow = 0;
let wordleCurrentCol = 0;
let wordleGameOver = false;

function initWordleGame() {
    wordleTarget = wordleWords[Math.floor(Math.random() * wordleWords.length)];
    wordleCurrentRow = 0;
    wordleCurrentCol = 0;
    wordleGameOver = false;
    
    createWordleGrid();
    createWordleKeyboard();
    updateWordleDisplay();
}

function createWordleGrid() {
    const grid = document.getElementById('wordle-grid');
    grid.innerHTML = '';
    
    for (let row = 0; row < 6; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'wordle-row';
        
        for (let col = 0; col < 5; col++) {
            const cell = document.createElement('div');
            cell.className = 'wordle-cell';
            cell.id = `cell-${row}-${col}`;
            rowDiv.appendChild(cell);
        }
        
        grid.appendChild(rowDiv);
    }
}

function createWordleKeyboard() {
    const keyboard = document.getElementById('wordle-keyboard');
    const rows = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
    ];
    
    keyboard.innerHTML = '';
    
    rows.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        
        row.forEach(key => {
            const button = document.createElement('button');
            button.className = `key-button ${key.length > 1 ? 'wide' : ''}`;
            button.textContent = key;
            button.onclick = () => handleWordleKey(key);
            rowDiv.appendChild(button);
        });
        
        keyboard.appendChild(rowDiv);
    });
}

function handleWordleKey(key) {
    if (wordleGameOver) return;
    
    if (key === 'ENTER') {
        if (wordleCurrentCol === 5) {
            checkWordleGuess();
        }
    } else if (key === 'BACK') {
        if (wordleCurrentCol > 0) {
            wordleCurrentCol--;
            document.getElementById(`cell-${wordleCurrentRow}-${wordleCurrentCol}`).textContent = '';
        }
    } else if (wordleCurrentCol < 5) {
        document.getElementById(`cell-${wordleCurrentRow}-${wordleCurrentCol}`).textContent = key;
        wordleCurrentCol++;
    }
}

function checkWordleGuess() {
    const guess = [];
    for (let col = 0; col < 5; col++) {
        guess.push(document.getElementById(`cell-${wordleCurrentRow}-${col}`).textContent);
    }
    
    const guessWord = guess.join('');
    const targetArray = wordleTarget.split('');
    
    // Check each letter
    for (let col = 0; col < 5; col++) {
        const cell = document.getElementById(`cell-${wordleCurrentRow}-${col}`);
        const letter = guess[col];
        
        if (letter === targetArray[col]) {
            cell.classList.add('correct');
            updateKeyboardKey(letter, 'correct');
        } else if (targetArray.includes(letter)) {
            cell.classList.add('present');
            updateKeyboardKey(letter, 'present');
        } else {
            cell.classList.add('absent');
            updateKeyboardKey(letter, 'absent');
        }
    }
    
    if (guessWord === wordleTarget) {
        wordleGameOver = true;
        const score = (6 - wordleCurrentRow) * 10;
        addScore('word-warper', score);
        setTimeout(() => showModal('Congratulations!', score, true), 1000); // Pass true for high score if logic desired
    } else if (wordleCurrentRow === 5) {
        wordleGameOver = true;
        setTimeout(() => showModal('Game Over!', 0), 1000);
    } else {
        wordleCurrentRow++;
        wordleCurrentCol = 0;
    }
    
    updateWordleDisplay();
}

function updateKeyboardKey(letter, status) {
    const keys = document.querySelectorAll('.key-button');
    keys.forEach(key => {
        if (key.textContent === letter) {
            // Only update to a 'better' status
            if (key.classList.contains('absent') && (status === 'correct' || status === 'present')) {
                key.classList.remove('absent');
                key.classList.add(status);
            } else if (key.classList.contains('present') && status === 'correct') {
                key.classList.remove('present');
                key.classList.add(status);
            } else if (!key.classList.contains('correct') && !key.classList.contains('present') && !key.classList.contains('absent')) {
                 key.classList.add(status);
            }
        }
    });
}

function updateWordleDisplay() {
    document.getElementById('wordle-attempts').textContent = wordleCurrentRow;
}

// Reaction Game
let reactionStartTime = 0;
let reactionTimeout = null;
let reactionBestTime = localStorage.getItem('reaction-best') || null;

function initReactionGame() {
    if (reactionBestTime) {
        document.getElementById('reaction-best').textContent = reactionBestTime;
    }
    resetReactionGame();
}

function resetReactionGame() {
    const area = document.getElementById('reaction-area');
    const text =document.getElementById('reaction-text');
    const button = document.getElementById('reaction-button');
    const results = document.getElementById('reaction-results');
    
    area.className = 'reaction-area';
    text.textContent = 'Click "Start" to begin!';
    button.textContent = 'Start';
    button.onclick = startReactionTest;
    button.style.display = 'block'; // Ensure button is visible
    
    if (reactionTimeout) {
        clearTimeout(reactionTimeout);
    }
    results.innerHTML = ''; // Clear previous results
}

function startReactionTest() {
    const area = document.getElementById('reaction-area');
    const text = document.getElementById('reaction-text');
    const button = document.getElementById('reaction-button');
    
    area.className = 'reaction-area waiting';
    text.textContent = 'Wait for green...';
    button.style.display = 'none';
    
    const delay = Math.random() * 4000 + 1000; // 1-5 seconds
    
    reactionTimeout = setTimeout(() => {
        area.className = 'reaction-area ready';
        text.textContent = 'CLICK NOW!';
        reactionStartTime = Date.now();
        
        area.onclick = recordReactionTime;
    }, delay);
}

function recordReactionTime() {
    if (reactionStartTime === 0) { // Clicked too early
        endReactionGame(0); // Pass 0 for early click
        return;
    }

    const reactionTime = Date.now() - reactionStartTime;
    endReactionGame(reactionTime);
}

function endReactionGame(reactionTime) {
    const area = document.getElementById('reaction-area');
    const text = document.getElementById('reaction-text');
    const button = document.getElementById('reaction-button');
    const results = document.getElementById('reaction-results');

    clearTimeout(reactionTimeout);
    reactionStartTime = 0; // Reset start time

    area.onclick = null;
    area.className = 'reaction-area';
    button.style.display = 'block';
    button.textContent = 'Try Again';
    button.onclick = startReactionTest;

    let scoreValue = 0;
    let modalTitle = 'Game Over!';

    if (reactionTime === 0) { // Clicked too early
        text.textContent = 'Too Soon!';
        modalTitle = 'Too Soon!';
        scoreValue = 0;
    } else {
        text.textContent = `${reactionTime}ms`;
        scoreValue = Math.max(0, 1000 - reactionTime); // Score inverse to time
        
        // Update best time
        if (!reactionBestTime || reactionTime < parseInt(reactionBestTime)) {
            reactionBestTime = reactionTime;
            localStorage.setItem('reaction-best', reactionBestTime);
            document.getElementById('reaction-best').textContent = reactionBestTime;
            showModal('New High Score!', scoreValue, true); // Indicate high score
            return; // Exit to prevent showModal being called twice
        }
    }
    
    // Add to results
    const resultCard = document.createElement('div');
    resultCard.className = 'result-card';
    resultCard.innerHTML = `
        <div class="result-time">${reactionTime === 0 ? '---' : reactionTime + 'ms'}</div>
        <div>${reactionTime === 0 ? 'Early Click' : getReactionRating(reactionTime)}</div>
    `;
    results.appendChild(resultCard);
    
    // Keep only last 5 results
    while (results.children.length > 5) {
        results.removeChild(results.firstChild);
    }
    
    addScore('blink-reaction', scoreValue);
    showModal(modalTitle, scoreValue);
}


function getReactionRating(time) {
    if (time < 200) return 'Lightning!';
    if (time < 300) return 'Excellent!';
    if (time < 400) return 'Good!';
    if (time < 500) return 'Average';
    return 'Slow';
}

// Snake Game
let snakeCanvas, snakeCtx;
let snake = [];
let food = {};
let snakeDirection = { x: 0, y: 0 };
let snakeScore = 0;
let snakeHighScore = localStorage.getItem('snake-high-score') || 0;
let snakeGameRunning = false;
let snakeGameInterval; // To store the interval ID

function initSnakeGame() {
    snakeCanvas = document.getElementById('snake-canvas');
    snakeCtx = snakeCanvas.getContext('2d');
    
    document.getElementById('snake-high-score').textContent = snakeHighScore;
    
    // Add keyboard controls only once
    document.removeEventListener('keydown', handleSnakeKeyPress); // Prevent multiple listeners
    document.addEventListener('keydown', handleSnakeKeyPress);
    
    resetSnakeGame();
}

function resetSnakeGame() {
    snake = [{ x: 200, y: 200 }];
    food = { x: 100, y: 100 };
    snakeDirection = { x: 0, y: 0 };
    snakeScore = 0;
    snakeGameRunning = false;
    
    // Clear any existing interval
    if (snakeGameInterval) {
        clearInterval(snakeGameInterval);
    }

    document.getElementById('snake-score').textContent = snakeScore;
    drawSnakeGame();
}

function startSnakeGame() {
    if (snakeGameRunning) return;
    
    resetSnakeGame(); // Ensure game is reset before starting
    snakeGameRunning = true;
    snakeDirection = { x: 20, y: 0 }; // Start moving right
    generateFood();
    snakeGameInterval = setInterval(gameLoop, 150); // Store interval ID
}

function handleSnakeKeyPress(e) {
    if (!snakeGameRunning) return;
    
    const key = e.key.toLowerCase();
    
    switch(key) {
        case 'arrowup':
        case 'w':
            if (snakeDirection.y === 0) snakeDirection = { x: 0, y: -20 };
            break;
        case 'arrowdown':
        case 's':
            if (snakeDirection.y === 0) snakeDirection = { x: 0, y: 20 };
            break;
        case 'arrowleft':
        case 'a':
            if (snakeDirection.x === 0) snakeDirection = { x: -20, y: 0 };
            break;
        case 'arrowright':
        case 'd':
            if (snakeDirection.x === 0) snakeDirection = { x: 20, y: 0 };
            break;
    }
}

function gameLoop() {
    if (!snakeGameRunning) return;
    
    updateSnake();
    drawSnakeGame();
}

function updateSnake() {
    const head = { x: snake[0].x + snakeDirection.x, y: snake[0].y + snakeDirection.y };
    
    // Check wall collision
    if (head.x < 0 || head.x >= 400 || head.y < 0 || head.y >= 400) {
        endSnakeGame();
        return;
    }
    
    // Check self collision
    for (let i = 1; i < snake.length; i++) { // Start from 1 to ignore head itself
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endSnakeGame();
            return;
        }
    }
    
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        snakeScore += 10;
        document.getElementById('snake-score').textContent = snakeScore;
        generateFood();
    } else {
        snake.pop();
    }
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * 20) * 20, // Canvas is 400x400, segments 20x20 => 20 columns/rows
        y: Math.floor(Math.random() * 20) * 20
    };
    
    // Make sure food doesn't spawn on snake
    for (let segment of snake) {
        if (food.x === segment.x && food.y === segment.y) {
            generateFood(); // Recurse if collision
            return;
        }
    }
}

function drawSnakeGame() {
    // Clear canvas
    snakeCtx.fillStyle = 'rgba(0, 0, 0, 0.3)'; // Slightly transparent to let background show
    snakeCtx.fillRect(0, 0, 400, 400);
    
    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        if (i === 0) { // Head
            const gradient = snakeCtx.createRadialGradient(
                segment.x + 9, segment.y + 9, 0,
                segment.x + 9, segment.y + 9, 9
            );
            gradient.addColorStop(0, '#4ecdc4');
            gradient.addColorStop(1, '#44a08d');
            snakeCtx.fillStyle = gradient;
        } else { // Body
            snakeCtx.fillStyle = '#4ecdc4';
        }
        snakeCtx.fillRect(segment.x, segment.y, 18, 18);
    }
    
    // Draw food
    snakeCtx.fillStyle = '#ff6b6b';
    snakeCtx.shadowColor = '#ff6b6b';
    snakeCtx.shadowBlur = 10;
    snakeCtx.fillRect(food.x, food.y, 18, 18);
    snakeCtx.shadowBlur = 0; // Reset shadow
}

function endSnakeGame() {
    snakeGameRunning = false;
    if (snakeGameInterval) {
        clearInterval(snakeGameInterval);
    }
    
    let isNewHighScore = false;
    if (snakeScore > snakeHighScore) {
        snakeHighScore = snakeScore;
        localStorage.setItem('snake-high-score', snakeHighScore);
        document.getElementById('snake-high-score').textContent = snakeHighScore;
        isNewHighScore = true;
    }
    
    addScore('serpent-sprint', snakeScore);
    showModal('Game Over!', snakeScore, isNewHighScore);
}

// Memory Game
let memoryCards = [];
let memoryFlippedCards = [];
let memoryMoves = 0;
let memoryPairs = 0;
let memoryGameActive = false;
let memoryTimeout = null; // To prevent rapid clicks and clear previous timeouts

const memoryIcons = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎵', '⚽']; // Added 2 more for 8 unique pairs

function initMemoryGame() {
    startMemoryGame();
}

function startMemoryGame() {
    memoryCards = [];
    memoryFlippedCards = [];
    memoryMoves = 0;
    memoryPairs = 0;
    memoryGameActive = true;
    
    if (memoryTimeout) {
        clearTimeout(memoryTimeout);
    }

    // Create card pairs
    const icons = [...memoryIcons, ...memoryIcons];
    icons.sort(() => Math.random() - 0.5); // Shuffle
    
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';
    
    icons.forEach((icon, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.icon = icon;
        card.dataset.index = index; // Keep index for uniqueness
        card.onclick = () => flipMemoryCard(card);
        grid.appendChild(card);
        memoryCards.push(card);
    });
    
    updateMemoryDisplay();
}

function flipMemoryCard(card) {
    if (!memoryGameActive || card.classList.contains('flipped') || card.classList.contains('matched') || memoryFlippedCards.length >= 2) {
        return;
    }
    
    card.classList.add('flipped');
    card.textContent = card.dataset.icon;
    memoryFlippedCards.push(card);
    
    if (memoryFlippedCards.length === 2) {
        memoryMoves++;
        updateMemoryDisplay();
        
        memoryTimeout = setTimeout(() => {
            checkMemoryMatch();
        }, 1000);
    }
}

function checkMemoryMatch() {
    const [card1, card2] = memoryFlippedCards;
    
    if (card1.dataset.icon === card2.dataset.icon) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        // Remove click handlers for matched cards
        card1.onclick = null;
        card2.onclick = null;

        memoryPairs++;
        
        if (memoryPairs === memoryIcons.length) { // All pairs found
            memoryGameActive = false;
            const score = Math.max(0, 200 - memoryMoves * 5); // Score based on fewer moves
            addScore('memory-mash', score);
            setTimeout(() => showModal('Congratulations!', score, true), 500);
        }
    } else {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        card1.textContent = '';
        card2.textContent = '';
    }
    
    memoryFlippedCards = [];
    updateMemoryDisplay();
}

function updateMemoryDisplay() {
    document.getElementById('memory-moves').textContent = memoryMoves;
    document.getElementById('memory-pairs').textContent = memoryPairs;
}

// --- NEW GAMES ---

// Typing Turbo Game
const typingTexts = [
    "The quick brown fox jumps over the lazy dog.",
    "Never underestimate the power of a good book.",
    "Innovation distinguishes between a leader and a follower.",
    "The early bird catches the worm.",
    "Practice makes perfect, especially with typing.",
    "Programming is thinking, not typing.",
    "Believe you can and you're halfway there.",
    "The only way to do great work is to love what you do."
];

let typingCurrentText = '';
let typingInput = null;
let typingDisplay = null;
let typingTimer = null;
let typingTimeLeft = 60;
let typingGameRunning = false;

function initTypingGame() {
    typingInput = document.getElementById('typing-input');
    typingDisplay = document.getElementById('typing-text-display');

    typingInput.removeEventListener('input', checkTypingInput);
    typingInput.addEventListener('input', checkTypingInput);

    resetTypingGame();
}

function resetTypingGame() {
    typingCurrentText = typingTexts[Math.floor(Math.random() * typingTexts.length)];
    typingDisplay.textContent = typingCurrentText;

    typingInput.value = '';
    typingInput.disabled = true;
    typingInput.classList.remove('error-animation', 'success-animation');

    typingTimeLeft = 60;
    typingGameRunning = false;

    document.getElementById('typing-time').textContent = typingTimeLeft;
    document.getElementById('typing-results').innerHTML = '';
    document.getElementById('typing-start-button').style.display = 'block';
}

function startTypingGame() {
    if (typingGameRunning) return;

    resetTypingGame();

    typingGameRunning = true;
    typingInput.disabled = false;
    typingInput.focus();
    document.getElementById('typing-start-button').style.display = 'none';

    typingTimer = setInterval(() => {
        typingTimeLeft--;
        document.getElementById('typing-time').textContent = typingTimeLeft;

        if (typingTimeLeft <= 0) {
            endTypingGame();
        }
    }, 1000);
}

// Compare the typed input against the target sentence up to current length
function checkTypingInput() {
    if (!typingGameRunning) return;

    const typedValue = typingInput.value;
    const target = typingCurrentText;

    // Reset styles first
    typingInput.classList.remove('error-animation', 'success-animation');

    // Error if typed so far does not match beginning of target
    if (!target.startsWith(typedValue)) {
        typingInput.classList.add('error-animation');
    }

    // Complete correct sentence entered - game over
    if (typedValue === target) {
        typingInput.classList.add('success-animation');
        endTypingGame();
    }
}

function endTypingGame() {
    typingGameRunning = false;
    clearInterval(typingTimer);
    typingInput.disabled = true;

    // Calculate WPM based on total words in the sentence and elapsed time
    const wordsCount = typingCurrentText.trim().split(/\s+/).length;
    const elapsedTime = 60 - typingTimeLeft || 1; // seconds
    const wpm = (wordsCount / elapsedTime) * 60;

    document.getElementById('typing-results').innerHTML = 
        `Completed! Words: ${wordsCount}<br>WPM: ${wpm.toFixed(0)}`;

    addScore('typing-turbo', wordsCount);
    showModal('Typing Test Complete!', wordsCount);

    document.getElementById('typing-start-button').style.display = 'block';
}
// --- Color Craze Game (Fixed) ---
const colors = [
    { name: "Red", value: "#FF0000" },
    { name: "Green", value: "#00FF00" },
    { name: "Blue", value: "#0000FF" },
    { name: "Yellow", value: "#FFFF00" },
    { name: "Cyan", value: "#00FFFF" },
    { name: "Magenta", value: "#FF00FF" },
    { name: "Orange", value: "#FFA500" },
    { name: "Purple", value: "#800080" },
    { name: "Lime", value: "#32CD32" }
];
let colorScore = 0;
let colorTimeLeft = 30;
let colorTimer = null;
let colorGameRunning = false;
let correctColorName = '';
function initColorGame() {
    colorScore = 0;
    colorTimeLeft = 30;
    colorGameRunning = false;
    clearInterval(colorTimer);
    document.getElementById('color-score').textContent = colorScore;
    document.getElementById('color-time').textContent = colorTimeLeft;
    document.getElementById('color-prompt').textContent = 'Click "Start" to begin!';
    document.getElementById('color-start-button').style.display = 'block';
    document.getElementById('color-options-grid').innerHTML = '';
}
function startColorGame() {
    if (colorGameRunning) return;
    colorGameRunning = true;
    document.getElementById('color-start-button').style.display = 'none';
    clearInterval(colorTimer);
    colorTimer = setInterval(() => {
        colorTimeLeft--;
        document.getElementById('color-time').textContent = colorTimeLeft;
        if (colorTimeLeft <= 0) {
            endColorGame();
        }
    }, 1000);
    generateColorRound();
}
function generateColorRound() {
    const optionsContainer = document.getElementById('color-options-grid');
    optionsContainer.innerHTML = '';
    const correctColor = colors[Math.floor(Math.random() * colors.length)];
    correctColorName = correctColor.name;
    document.getElementById('color-prompt').textContent = `Find: ${correctColorName}`;
    let shuffledColors = [...colors].sort(() => 0.5 - Math.random()).slice(0, 8);
    if (!shuffledColors.some(c => c.name === correctColorName)) {
        shuffledColors[Math.floor(Math.random() * shuffledColors.length)] = correctColor;
    }
    shuffledColors.sort(() => 0.5 - Math.random());
    shuffledColors.forEach(color => {
        const button = document.createElement('button');
        button.className = 'color-option-button';
        button.style.backgroundColor = color.value;
        button.dataset.name = color.name;
        button.onclick = () => checkColorAnswer(color.name, button);
        optionsContainer.appendChild(button);
    });
}
function checkColorAnswer(selectedName, button) {
    if (!colorGameRunning) return;
    if (selectedName === correctColorName) {
        colorScore++;
        document.getElementById('color-score').textContent = colorScore;
        button.classList.add('correct');
        setTimeout(generateColorRound, 300);
    } else {
        button.classList.add('incorrect');
        setTimeout(() => {
            button.classList.remove('incorrect');
        }, 300);
    }
}
function endColorGame() {
    colorGameRunning = false;
    clearInterval(colorTimer);
    document.getElementById('color-start-button').style.display = 'block';
    addScore('color-craze', colorScore);
    showModal('Color Craze Over!', colorScore);
}

// --- Number Ninja Game (Fixed) ---
let currentNumberQuestion = {};
let numberScore = 0;
let numberLives = 3;
let numberGameRunning = false;
let numberInput = null;
let numberQuestionDisplay = null;
function initNumberGame() {
    numberInput = document.getElementById('number-input');
    numberQuestionDisplay = document.getElementById('number-question');
    const submitBtn = document.getElementById('number-submit-button');
    const startBtn = document.getElementById('number-start-button');
    numberInput.value = '';
    numberInput.disabled = true;
    numberInput.removeEventListener('keydown', handleNumberInputKey);
    numberInput.addEventListener('keydown', handleNumberInputKey);
    submitBtn.removeEventListener('click', checkNumberAnswer);
    submitBtn.addEventListener('click', checkNumberAnswer);
    submitBtn.style.display = 'none';
    startBtn.style.display = 'block';
    resetNumberGame();
}
function resetNumberGame() {
    numberScore = 0;
    numberLives = 3;
    numberGameRunning = false;
    document.getElementById('number-score').textContent = numberScore;
    document.getElementById('number-lives').textContent = numberLives;
    numberQuestionDisplay.textContent = 'Click "Start" to begin!';
    numberInput.value = '';
    numberInput.disabled = true;
    document.getElementById('number-submit-button').style.display = 'none';
    document.getElementById('number-start-button').style.display = 'block';
}
function startNumberGame() {
    if (numberGameRunning) return;
    resetNumberGame();
    numberGameRunning = true;
    numberInput.disabled = false;
    numberInput.focus();
    document.getElementById('number-submit-button').style.display = 'inline-block';
    document.getElementById('number-start-button').style.display = 'none';
    generateNumberQuestion();
}
function generateNumberQuestion() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operator = ['+', '-', '*'][Math.floor(Math.random() * 3)];
    let questionString = `${num1} ${operator} ${num2}`;
    let answer;
    switch (operator) {
        case '+': answer = num1 + num2; break;
        case '-': answer = num1 - num2; break;
        case '*': answer = num1 * num2; break;
    }
    currentNumberQuestion = { question: questionString, answer: answer };
    numberQuestionDisplay.textContent = currentNumberQuestion.question;
    numberInput.value = '';
    numberInput.focus();
}
function handleNumberInputKey(e) {
    if (e.key === 'Enter') {
        checkNumberAnswer();
    }
}
function checkNumberAnswer() {
    if (!numberGameRunning) return;
    let userAnswer = parseInt(numberInput.value);
    if (isNaN(userAnswer)) {
        numberInput.classList.add('error-animation');
        setTimeout(() => numberInput.classList.remove('error-animation'), 500);
        return;
    }
    if (userAnswer === currentNumberQuestion.answer) {
        numberScore += 10;
        document.getElementById('number-score').textContent = numberScore;
        numberInput.classList.add('success-animation');
        setTimeout(() => {
            numberInput.classList.remove('success-animation');
            generateNumberQuestion();
        }, 500);
    } else {
        numberLives--;
        document.getElementById('number-lives').textContent = numberLives;
        numberInput.classList.add('error-animation');
        setTimeout(() => {
            numberInput.classList.remove('error-animation');
            if (numberLives <= 0) {
                endNumberGame();
            } else {
                generateNumberQuestion();
            }
        }, 700);
    }
}
function endNumberGame() {
    numberGameRunning = false;
    numberInput.disabled = true;
    document.getElementById('number-submit-button').style.display = 'none';
    document.getElementById('number-start-button').style.display = 'block';
    addScore('number-ninja', numberScore);
    showModal('Number Ninja Over!', numberScore);
}

// --- Click Commando Game (Fixed) ---
let clickCount = 0;
let clickTimeLeft = 10;
let clickTimer = null;
let clickGameRunning = false;
let clickArea = null;
function initClickGame() {
    clickArea = document.getElementById('click-area');
    clickArea.removeEventListener('click', handleAreaClick);
    clickArea.addEventListener('click', handleAreaClick);
    document.getElementById('click-start-button').style.display = 'block';
    resetClickGame();
}
function resetClickGame() {
    clickCount = 0;
    clickTimeLeft = 10;
    clickGameRunning = false;
    document.getElementById('click-count').textContent = clickCount;
    document.getElementById('click-time').textContent = clickTimeLeft;
    document.getElementById('click-instructions').textContent = 'Click the target!';
    clickArea.classList.remove('active-target');
    clickArea.style.cursor = 'default';
}
function startClickGame() {
    if (clickGameRunning) return;
    resetClickGame();
    clickGameRunning = true;
    document.getElementById('click-start-button').style.display = 'none';
    clickArea.classList.add('active-target');
    clickArea.style.cursor = 'pointer';
    document.getElementById('click-instructions').textContent = 'Click!';
    clearInterval(clickTimer);
    clickTimer = setInterval(() => {
        clickTimeLeft--;
        document.getElementById('click-time').textContent = clickTimeLeft;
        if (clickTimeLeft <= 0) {
            endClickGame();
        }
    }, 1000);
}
function handleAreaClick() {
    if (!clickGameRunning) return;
    clickCount++;
    document.getElementById('click-count').textContent = clickCount;
    clickArea.style.backgroundColor = 'rgba(255,255,255,0.3)';
    setTimeout(() => {
        if(clickGameRunning) clickArea.style.backgroundColor = '';
    }, 50);
}
function endClickGame() {
    clickGameRunning = false;
    clearInterval(clickTimer);
    document.getElementById('click-start-button').style.display = 'block';
    clickArea.classList.remove('active-target');
    clickArea.style.cursor = 'default';
    document.getElementById('click-instructions').textContent = 'Game Over!';
    addScore('click-commando', clickCount);
    showModal('Click Commando Over!', clickCount);
}

// Utility Functions
function addLeaderboardStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .leaderboard-list {
            width: 100%;
        }
        
        .leaderboard-entry {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            margin-bottom: 0.5rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            transition: all 0.3s ease;
        }
        
        .leaderboard-entry:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateX(5px);
        }
        
        .rank {
            font-weight: bold;
            color: #feca57;
            min-width: 40px;
        }
        
        .score {
            font-weight: bold;
            color: #4ecdc4;
            font-size: 1.2rem;
        }
        
        .date {
            opacity: 0.7;
            font-size: 0.9rem;
        }
    `;
    document.head.appendChild(style);
}

// Initialize leaderboard styles
addLeaderboardStyles();

// Add some sample data for demonstration
if (Object.values(gameScores).every(scores => scores.length === 0)) {
    gameScores['brainy-blitz'] = [
        { score: 85, date: new Date(Date.now() - 86400000).toISOString() },
        { score: 70, date: new Date(Date.now() - 172800000).toISOString() }
    ];
    gameScores['serpent-sprint'] = [
        { score: 120, date: new Date(Date.now() - 86400000).toISOString() },
        { score: 90, date: new Date(Date.now() - 172800000).toISOString() }
    ];
    // Add sample data for new games
    gameScores['typing-turbo'] = [
        { score: 45, date: new Date(Date.now() - 86400000 * 2).toISOString() },
        { score: 60, date: new Date(Date.now() - 86400000 * 3).toISOString() }
    ];
    gameScores['color-craze'] = [
        { score: 25, date: new Date(Date.now() - 86400000 * 4).toISOString() },
        { score: 20, date: new Date(Date.now() - 86400000 * 5).toISOString() }
    ];
    saveScores();
}

// Add smooth scrolling and enhanced animations
document.addEventListener('DOMContentLoaded', function() {
    // Add intersection observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    // Observe game cards
    document.querySelectorAll('.game-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC to go back
    if (e.key === 'Escape') {
        if (currentGame) {
            backToGames();
        }
    }
    
    // Number keys for quick game selection
    if (e.key >= '1' && e.key <= '9' && !currentGame) { // Adjusted for 9 games
        const games = ['brainy-blitz', 'word-warper', 'blink-reaction', 'serpent-sprint', 'memory-mash', 'typing-turbo', 'color-craze', 'number-ninja', 'click-commando'];
        const gameIndex = parseInt(e.key) - 1;
        if (games[gameIndex]) {
            startGame(games[gameIndex]);
        }
    }
});

// Add touch support for mobile
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', function(e) {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // Swipe detection for snake game
    if (currentGame === 'serpent-sprint' && snakeGameRunning) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe
            if (diffX > 50 && snakeDirection.x === 0) { // Swiped left
                snakeDirection = { x: -20, y: 0 };
            } else if (diffX < -50 && snakeDirection.x === 0) { // Swiped right
                snakeDirection = { x: 20, y: 0 };
            }
        } else {
            // Vertical swipe
            if (diffY > 50 && snakeDirection.y === 0) { // Swiped up
                snakeDirection = { x: 0, y: -20 };
            } else if (diffY < -50 && snakeDirection.y === 0) { // Swiped down
                snakeDirection = { x: 0, y: 20 };
            }
        }
    }
    
    touchStartX = 0;
    touchStartY = 0;
});

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized resize handler
const handleResize = debounce(() => {
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}, 250);

window.addEventListener('resize', handleResize);
