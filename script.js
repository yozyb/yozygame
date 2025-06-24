// ========== VARIÁVEIS GLOBAIS ==========
const startScreen = document.getElementById('start-screen');
const levelSelectScreen = document.getElementById('level-select-screen');
const levelsContainer = document.getElementById('levels-container');
const backToMenuBtn = document.getElementById('back-to-menu');
const gameContainer = document.getElementById('game');
const startGameBtn = document.getElementById('start-game-btn');
const skinShopBtn = document.getElementById('skin-shop-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsMenu = document.getElementById('settings-menu');
const saveSettingsBtn = document.getElementById('save-settings');
const skinsBackground = document.getElementById('skins-background');
const bobi = document.getElementById('bobi');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const gameOverDisplay = document.getElementById('game-over');
const victoryDisplay = document.getElementById('victory');
const toggleSkinShopBtn = document.getElementById('toggle-skin-shop');
const skinShop = document.getElementById('skin-shop');
const skinOptions = document.querySelectorAll('.skin-option');
const pauseBtn = document.getElementById('pause-btn');
const pauseMenu = document.getElementById('pause-menu');
const resumeBtn = document.getElementById('resume-btn');
const quitBtn = document.getElementById('quit-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const jumpBtn = document.getElementById('jump-btn');
const backgroundMusic = document.getElementById('backgroundMusic');
backgroundMusic.volume = 0.4;

// Configurações do jogo
let gameStarted = false;
let isPaused = false;
let timer = 0;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let obstacles = [];
let coins = [];
let clouds = [];
let gravity = 0.8;
let isJumping = false;
let velocityY = 0;
let groundHeight = 50;
let bobiBottom = groundHeight;
let bobiHeight = 50;
let baseSpeed = 5;
let currentSpeed = baseSpeed;
let language = 'pt';
let soundEffectsEnabled = true;
let selectedLevel = 1;
let levelComplete = false;
let unlockedLevels = localStorage.getItem('unlockedLevels') ? parseInt(localStorage.getItem('unlockedLevels')) : 1;
let obstacleInterval, coinInterval, cloudInterval;
let levelTimeLimit = 60;
let bobiLeft = 50;
let moveLeft = false;
let moveRight = false;

// Mapeamento de skins e cores
const skinSkyColors = {
    "skin-lloyd": "#87CEFA",
    "skin-kai": "#FF6347",
    "skin-jay": "#1E90FF",
    "skin-cole": "#696969",
    "skin-zane": "#E0FFFF",
    "skin-steve": "#32CD32",
    "skin-alex": "#FF69B4",
    "skin-batman": "#00008B",
};

const skins = [
    { class: "skin-lloyd", color: "#32CD32", detail: "🍀" },
    { class: "skin-kai", color: "#FF4500", detail: "🔥" },
    { class: "skin-jay", color: "#1E90FF", detail: "⚡" },
    { class: "skin-cole", color: "#000000", detail: "⛰️" },
    { class: "skin-zane", color: "#FFFFFF", detail: "❄️" },
    { class: "skin-steve", color: "#4CAF50", detail: "⛏️" },
];

const translations = {
    pt: {
        play: "JOGAR",
        skinShop: "LOJA DE SKINS",
        settings: "DEFINIÇÕES",
        difficulty: "Dificuldade",
        easy: "Fácil (Velocidade lenta)",
        medium: "Médio (Velocidade normal)",
        hard: "Difícil (Velocidade rápida)",
        language: "Idioma",
        save: "SALVAR",
        chooseSkin: "ESCOLHA SUA SKIN",
        highScore: "Recorde: ",
        gameOver: "GAME OVER",
        victory: "VENCESTE!",
        createdBy: "Criado por YOZY",
        chooseLevel: "ESCOLHA O NÍVEL",
        back: "VOLTAR",
        pause: "PAUSAR",
        resume: "CONTINUAR",
        quit: "SAIR",
        paused: "JOGO PAUSED"
    },
    en: {
        play: "PLAY",
        skinShop: "SKIN SHOP",
        settings: "SETTINGS",
        difficulty: "Difficulty",
        easy: "Easy (Slow speed)",
        medium: "Medium (Normal speed)",
        hard: "Hard (Fast speed)",
        language: "Language",
        save: "SAVE",
        chooseSkin: "CHOOSE YOUR SKIN",
        highScore: "High Score: ",
        gameOver: "GAME OVER",
        victory: "YOU WIN!",
        chooseLevel: "CHOOSE LEVEL",
        back: "BACK",
        pause: "PAUSE",
        resume: "RESUME",
        quit: "QUIT",
        paused: "GAME PAUSED"
    }
};

// ========== INICIALIZAÇÃO ==========
function initGame() {
    createSkinBackground();
    loadSettings();
    updateUI();
    createLevelButtons();
    setupEventListeners();
    enableAudio();
}

function createSkinBackground() {
    skins.forEach(skin => {
        const skinElement = document.createElement('div');
        skinElement.className = 'skin-preview-bg';
        skinElement.style.background = skin.color;
        skinElement.innerHTML = `<div style="font-size:30px;">${skin.detail}</div>`;
        skinsBackground.appendChild(skinElement);
    });
}

function loadSettings() {
    const savedLanguage = localStorage.getItem('language');
    const savedDifficulty = localStorage.getItem('difficulty');
    
    if (savedLanguage) {
        language = savedLanguage;
        document.querySelector(`input[name="language"][value="${savedLanguage}"]`).checked = true;
    }
    
    if (savedDifficulty) {
        baseSpeed = parseInt(savedDifficulty);
        document.querySelector(`input[name="difficulty"][value="${savedDifficulty}"]`).checked = true;
    }
}

function updateUI() {
    const t = translations[language];
    
    // Atualiza todos os textos da UI
    startGameBtn.textContent = t.play;
    skinShopBtn.textContent = t.skinShop;
    settingsBtn.textContent = t.settings;
    document.querySelector('.settings-title:first-child').textContent = t.difficulty;
    document.querySelector('label[for="easy"]').textContent = t.easy;
    document.querySelector('label[for="medium"]').textContent = t.medium;
    document.querySelector('label[for="hard"]').textContent = t.hard;
    document.querySelectorAll('.settings-title')[1].textContent = t.language;
    saveSettingsBtn.textContent = t.save;
    if (skinShop.querySelector('h3')) skinShop.querySelector('h3').textContent = t.chooseSkin;
    highScoreDisplay.textContent = t.highScore + highScore;
    gameOverDisplay.textContent = t.gameOver;
    victoryDisplay.textContent = t.victory;
    document.getElementById('footer').textContent = t.createdBy;
    if (toggleSkinShopBtn) toggleSkinShopBtn.textContent = t.skinShop;
    levelSelectScreen.querySelector('.title').textContent = t.chooseLevel;
    backToMenuBtn.textContent = t.back;
    pauseBtn.textContent = t.pause;
    resumeBtn.textContent = t.resume;
    quitBtn.textContent = t.quit;
    if (pauseMenu.querySelector('h2')) pauseMenu.querySelector('h2').textContent = t.paused;
}

function createLevelButtons() {
    levelsContainer.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
        const levelBtn = document.createElement('button');
        levelBtn.className = 'level-button';
        levelBtn.textContent = `${translations[language].chooseLevel.split(' ')[0]} ${i}`;
        
        if (i < unlockedLevels) levelBtn.classList.add('completed');
        if (i > unlockedLevels) levelBtn.disabled = true;
        
        levelBtn.addEventListener('click', () => {
            selectedLevel = i;
            startGame();
        });
        levelsContainer.appendChild(levelBtn);
    }
}

function setupEventListeners() {
    // Menu principal
    startGameBtn.addEventListener('click', () => {
        startScreen.style.display = 'none';
        levelSelectScreen.style.display = 'flex';
        backgroundMusic.play().catch(e => console.log("Audio error:", e));
    });

    backToMenuBtn.addEventListener('click', () => {
        levelSelectScreen.style.display = 'none';
        startScreen.style.display = 'flex';
    });

    // Configurações
    settingsBtn.addEventListener('click', () => {
        settingsMenu.style.display = 'block';
    });

    saveSettingsBtn.addEventListener('click', saveSettings);

    // Pausa
    pauseBtn.addEventListener('click', togglePause);
    resumeBtn.addEventListener('click', togglePause);
    quitBtn.addEventListener('click', quitToMenu);

    // Controles mobile
    leftBtn.addEventListener('touchstart', () => moveLeft = true);
    leftBtn.addEventListener('touchend', () => moveLeft = false);
    rightBtn.addEventListener('touchstart', () => moveRight = true);
    rightBtn.addEventListener('touchend', () => moveRight = false);
    jumpBtn.addEventListener('touchstart', jump);

    // Teclado
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Skins
    skinOptions.forEach(option => {
        option.addEventListener('click', () => {
            const selectedSkin = option.getAttribute('data-skin');
            bobi.className = selectedSkin;
            skinShop.style.display = 'none';
            if (skinSkyColors[selectedSkin]) {
                gameContainer.style.background = `linear-gradient(to top, ${skinSkyColors[selectedSkin]}, #e0f7fa)`;
            }
        });
    });

    if (toggleSkinShopBtn) {
        toggleSkinShopBtn.addEventListener('click', () => {
            skinShop.style.display = skinShop.style.display === 'none' ? 'block' : 'none';
        });
    }

    // Prevenir rolagem em mobile
    document.addEventListener('touchmove', preventScroll, { passive: false });
}

function enableAudio() {
    document.body.addEventListener('click', () => {
        document.querySelectorAll('audio').forEach(a => {
            a.play().then(() => a.pause()).catch(() => {});
        });
    }, { once: true });
}

// ========== FUNÇÕES DO JOGO ==========
function startGame() {
    resetGameState();
    levelSelectScreen.style.display = 'none';
    gameContainer.style.display = 'block';
    gameStarted = true;
    isPaused = false;

    // Configura dificuldade baseada no nível
    if (selectedLevel <= 3) baseSpeed = 5;
    else if (selectedLevel <= 7) baseSpeed = 7;
    else baseSpeed = 9;
    currentSpeed = baseSpeed;
    levelTimeLimit = selectedLevel * 60;

    // Inicia geradores de objetos
    obstacleInterval = setInterval(createObstacle, 1500);
    coinInterval = setInterval(createCoin, 3000);
    cloudInterval = setInterval(createCloud, 5000);

    // Primeiras nuvens
    for (let i = 0; i < 3; i++) createCloud();

    // Inicia loop do jogo
    requestAnimationFrame(gameLoop);
}

function resetGameState() {
    clearIntervals();
    timer = 0;
    score = 0;
    levelComplete = false;
    bobiBottom = groundHeight;
    bobiLeft = 50;
    velocityY = 0;
    isJumping = false;
    moveLeft = false;
    moveRight = false;

    // Limpa objetos do jogo
    obstacles.forEach(obs => obs.remove());
    coins.forEach(coin => coin.remove());
    clouds.forEach(cloud => cloud.remove());
    obstacles = [];
    coins = [];
    clouds = [];

    // Reseta UI
    timerDisplay.textContent = '0.00';
    scoreDisplay.textContent = '0';
    gameOverDisplay.style.display = 'none';
    victoryDisplay.style.display = 'none';
    bobi.style.animation = '';
    bobi.style.left = `${bobiLeft}px`;
    bobi.style.transform = 'translateY(0)';
}

function clearIntervals() {
    clearInterval(obstacleInterval);
    clearInterval(coinInterval);
    clearInterval(cloudInterval);
}

function gameLoop() {
    if (!gameStarted || isPaused) return;

    // Atualiza timer e dificuldade
    timer += 0.016;
    timerDisplay.textContent = timer.toFixed(2);
    currentSpeed = baseSpeed + Math.floor(timer / 10);

    checkLevelCompletion();
    updateBobiPosition();
    moveGameElements();
    checkCollisions();

    requestAnimationFrame(gameLoop);
}

function updateBobiPosition() {
    // Movimento vertical (pulo)
    velocityY -= gravity;
    bobiBottom += velocityY;
    
    if (bobiBottom <= groundHeight) {
        bobiBottom = groundHeight;
        isJumping = false;
        velocityY = 0;
    }
    bobi.style.transform = `translateY(${-bobiBottom + groundHeight}px)`;
    
    // Movimento horizontal
    if (moveLeft && bobiLeft > 0) bobiLeft -= currentSpeed;
    if (moveRight && bobiLeft < window.innerWidth - 50) bobiLeft += currentSpeed;
    bobi.style.left = `${bobiLeft}px`;
}

function moveGameElements() {
    // Obstáculos
    obstacles.forEach((obs, index) => {
        let obsLeft = parseFloat(obs.style.left) - currentSpeed;
        obs.style.left = `${obsLeft}px`;
        
        if (obsLeft < -40) {
            obs.remove();
            obstacles.splice(index, 1);
            score++;
            scoreDisplay.textContent = score;
        }
    });

    // Moedas
    coins.forEach((coin, index) => {
        let coinLeft = parseFloat(coin.style.left) - currentSpeed;
        coin.style.left = `${coinLeft}px`;
        
        if (coinLeft < -20) {
            coin.remove();
            coins.splice(index, 1);
        }
    });

    // Nuvens
    clouds.forEach((cloud, index) => {
        let cloudLeft = parseFloat(cloud.style.left) - currentSpeed * 0.5;
        cloud.style.left = `${cloudLeft}px`;
        
        if (cloudLeft < -200) {
            cloud.remove();
            clouds.splice(index, 1);
        }
    });
}

function checkCollisions() {
    const bobiRect = bobi.getBoundingClientRect();

    // Verifica colisão com obstáculos
    obstacles.forEach(obs => {
        const obsRect = obs.getBoundingClientRect();
        if (isColliding(bobiRect, obsRect)) {
            handleCollision();
            return;
        }
    });

    // Verifica coleta de moedas
    coins.forEach((coin, index) => {
        const coinRect = coin.getBoundingClientRect();
        if (isColliding(bobiRect, coinRect)) {
            coin.remove();
            coins.splice(index, 1);
            score += coin.classList.contains('power-coin') ? 20 : 5;
            scoreDisplay.textContent = score;
            
            if (coin.classList.contains('power-coin')) {
                activatePower(coin.dataset.type);
            }
        }
    });
}

function isColliding(rect1, rect2) {
    return !(
        rect1.right < rect2.left || 
        rect1.left > rect2.right || 
        rect1.bottom < rect2.top || 
        rect1.top > rect2.bottom
    );
}

function handleCollision() {
    playSound('crash-sound');
    bobi.style.animation = "blink 0.5s 3";
    setTimeout(gameOver, 500);
}

function checkLevelCompletion() {
    if (timer >= levelTimeLimit && !levelComplete) {
        levelComplete = true;
        victory();
    }
}

// ========== FUNÇÕES DE CONTROLE ==========
function jump() {
    if (!isJumping && gameStarted && !isPaused) {
        isJumping = true;
        velocityY = 15;
        playSound('jump-sound');
    }
}

function togglePause() {
    isPaused = !isPaused;
    pauseMenu.style.display = isPaused ? 'block' : 'none';
    pauseBtn.textContent = isPaused ? translations[language].resume : translations[language].pause;
    
    if (isPaused) {
        clearIntervals();
    } else {
        obstacleInterval = setInterval(createObstacle, 1500);
        coinInterval = setInterval(createCoin, 3000);
        cloudInterval = setInterval(createCloud, 5000);
        requestAnimationFrame(gameLoop);
    }
}

function quitToMenu() {
    togglePause();
    gameOver();
}

function handleKeyDown(e) {
    switch(e.key) {
        case 'ArrowUp': case ' ':
            if (gameStarted && !isPaused) jump();
            else if (startScreen.style.display !== 'none') startGameBtn.click();
            break;
        case 'ArrowLeft': case 'a': moveLeft = true; break;
        case 'ArrowRight': case 'd': moveRight = true; break;
        case 'Escape': if (gameStarted) togglePause(); break;
    }
}

function handleKeyUp(e) {
    switch(e.key) {
        case 'ArrowLeft': case 'a': moveLeft = false; break;
        case 'ArrowRight': case 'd': moveRight = false; break;
    }
}

function preventScroll(e) {
    if (gameStarted) e.preventDefault();
}

// ========== FUNÇÕES DE OBJETOS DO JOGO ==========
function createObstacle() {
    if (!gameStarted || isPaused) return;
    
    const obs = document.createElement('div');
    obs.className = 'obstacle';
    obs.style.left = `${window.innerWidth}px`;
    obs.style.bottom = `${groundHeight}px`;
    gameContainer.appendChild(obs);
    obstacles.push(obs);
}

function createCoin() {
    if (!gameStarted || isPaused) return;
    
    const coin = document.createElement('div');
    coin.className = 'coin';
    coin.style.left = `${window.innerWidth}px`;
    coin.style.bottom = `${Math.random() * 100 + 100}px`;
    gameContainer.appendChild(coin);
    coins.push(coin);
    
    // 10% chance de ser moeda de poder
    if (Math.random() < 0.1) {
        const types = ['fly', 'spin', 'giant'];
        const type = types[Math.floor(Math.random() * types.length)];
        coin.classList.add('power-coin');
        coin.dataset.type = type;
    }
}

function createCloud() {
    if (!gameStarted || isPaused) return;
    
    const cloud = document.createElement('div');
    cloud.className = 'cloud';
    const size = Math.random() * 50 + 30;
    cloud.style.width = `${size}px`;
    cloud.style.height = `${size * 0.6}px`;
    cloud.style.top = `${Math.random() * 50 + 10}%`;
    cloud.style.left = `${window.innerWidth}px`;
    gameContainer.appendChild(cloud);
    clouds.push(cloud);
}

function activatePower(type) {
    const powerClass = `bobi-${type}`;
    bobi.classList.add(powerClass);
    
    setTimeout(() => {
        bobi.classList.remove(powerClass);
    }, 6000);
}

// ========== FUNÇÕES DE FIM DE JOGO ==========
function gameOver() {
    gameStarted = false;
    clearIntervals();
    
    // Atualiza recorde
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreDisplay.textContent = translations[language].highScore + highScore;
    }
    
    gameOverDisplay.style.display = 'block';
    setTimeout(() => {
        startScreen.style.display = 'flex';
        gameContainer.style.display = 'none';
    }, 2000);
}

function victory() {
    gameStarted = false;
    clearIntervals();
    
    // Atualiza recorde
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreDisplay.textContent = translations[language].highScore + highScore;
    }
    
    // Desbloqueia próximo nível
    if (selectedLevel >= unlockedLevels) {
        unlockedLevels = selectedLevel + 1;
        localStorage.setItem('unlockedLevels', unlockedLevels);
    }
    
    victoryDisplay.style.display = 'block';
    setTimeout(() => {
        levelSelectScreen.style.display = 'flex';
        gameContainer.style.display = 'none';
        createLevelButtons();
    }, 2000);
}

// ========== FUNÇÕES UTILITÁRIAS ==========
function playSound(id) {
    if (!soundEffectsEnabled) return;
    const sound = document.getElementById(id);
    sound.currentTime = 0;
    sound.play().catch(e => console.log("Audio error:", e));
}

function saveSettings() {
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    language = document.querySelector('input[name="language"]:checked').value;
    
    baseSpeed = parseInt(difficulty);
    localStorage.setItem('difficulty', difficulty);
    localStorage.setItem('language', language);
    
    settingsMenu.style.display = 'none';
    updateUI();
}

// ========== INICIAR JOGO ==========
initGame();