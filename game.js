// Game Settings
const GAME_WIDTH = 600;
const GAME_HEIGHT = 800;
const STAR_COUNT = 100; // Number of stars in the background
const MAX_WEAPON_LEVEL = 5; // Max Weapon Level changed to 5
const BIG_ENEMY_THRESHOLD = 20; // Enemies with a radius larger than this will be considered "large enemies"
const DEFAULT_PLAYER_NAME = "Anonymous"; // Default Player Name

// Character settings
const CHARACTERS = {
    STANDARD: {
        name: "Standard",
        speed: 12,
        fireRate: 300,
        bulletSpeed: 10,
        color: '#00ff00',
        description: "Balanced"
    },
    SPEED: {
        name: "Speed",
        speed: 18, // Movement Speed ​​Up
        fireRate: 250, // Fire rate increase
        bulletSpeed: 12,
        color: '#00ffff',
        description: "High-speed movement"
    },
    POWER: {
        name: "Power",
        speed: 10, // Movement speed down
        fireRate: 350, // Fire rate down
        bulletSpeed: 9,
        color: '#ff5500',
        description: "High heat"
    },
    DEFENSE: {
        name: "Defense",
        speed: 9, // Movement speed down
        fireRate: 400, // Fire rate down
        bulletSpeed: 8, // Bullet speed down
        color: '#0066ff',
        description: "High durability",
        startWithShield: true // Start with a shield
    }
};

// Difficulty setting
const DIFFICULTY = {
    EASY: {
        name: "Easy",
        enemySpeedMin: 1.5,
        enemySpeedMax: 3.5,
        enemySpawnIntervalInitial: 1200,
        enemySpawnIntervalMin: 500,
        enemySpawnDecreaseRate: 0.97,
        enemyFireChance: 0.003,
        enemyBulletSpeed: 5,
        weaponDropChance: 0.3,
        shieldDropChance: 0.15,
        scoreMultiplier: 0.8
    },
    MEDIUM: {
        name: "Medium",
        enemySpeedMin: 2,
        enemySpeedMax: 5,
        enemySpawnIntervalInitial: 1000,
        enemySpawnIntervalMin: 300,
        enemySpawnDecreaseRate: 0.95,
        enemyFireChance: 0.005,
        enemyBulletSpeed: 6,
        weaponDropChance: 0.2,
        shieldDropChance: 0.1,
        scoreMultiplier: 1.0
    },
    HARD: {
        name: "Hard",
        enemySpeedMin: 3,
        enemySpeedMax: 7,
        enemySpawnIntervalInitial: 800,
        enemySpawnIntervalMin: 200,
        enemySpawnDecreaseRate: 0.93,
        enemyFireChance: 0.008,
        enemyBulletSpeed: 7,
        weaponDropChance: 0.15,
        shieldDropChance: 0.07,
        scoreMultiplier: 1.5
    }
};

// Current difficulty setting
let currentDifficulty = DIFFICULTY.MEDIUM;
// Current character settings
let currentCharacter = CHARACTERS.STANDARD;
// Current player name
let playerName = DEFAULT_PLAYER_NAME;


let canvas, ctx;
let player;
let bullets = [];
let enemyBullets = [];
let enemies = [];
let powerUps = [];
let shields = []; 
let explosions = []; 
let stars = []; 
let score = 0;
let enemiesDefeated = 0; 
let weaponLevel = 1;
let shieldCount = 0; 
let gameRunning = false;
let enemySpawnInterval;
let lastEnemySpawnTime = 0;
let keys = {};
let rankings = []; 


function initGame() {
    canvas = document.getElementById('gameCanvas');
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    ctx = canvas.getContext('2d');

    
    player = {
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT - 100,
        width: 35, 
        height: 35, 
        color: currentCharacter.color,
        lastFireTime: 0,
        fireRate: currentCharacter.fireRate,
        hasShield: currentCharacter.startWithShield || false
    };

    
    initStars();
    
    
    loadRankings();

    
    document.querySelector('.game-info').classList.add('hidden');

    
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });

    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    
    document.getElementById('easy-button').addEventListener('click', () => setDifficulty('EASY'));
    document.getElementById('medium-button').addEventListener('click', () => setDifficulty('MEDIUM'));
    document.getElementById('hard-button').addEventListener('click', () => setDifficulty('HARD'));

    
    document.querySelectorAll('.character-option').forEach(option => {
        option.addEventListener('click', () => {
            const characterType = option.getAttribute('data-character').toUpperCase();
            setCharacter(characterType);
        });
    });

    
    document.getElementById('player-name-input').addEventListener('input', updatePlayerName);

    
    document.getElementById('start-button').addEventListener('click', startGame);
    
    
    document.getElementById('restart-button').addEventListener('click', restartGame);
    
    
    setDifficulty('MEDIUM');
    setCharacter('STANDARD');
    
    
    const savedPlayerName = localStorage.getItem('spaceShooterPlayerName');
    if (savedPlayerName) {
        document.getElementById('player-name-input').value = savedPlayerName;
        updatePlayerName();
    }
}


function updatePlayerName() {
    const input = document.getElementById('player-name-input');
    playerName = input.value.trim() || DEFAULT_PLAYER_NAME;
    
    
    document.getElementById('player-name-display').textContent = playerName;
    
    
    localStorage.setItem('spaceShooterPlayerName', playerName);
}


function setDifficulty(level) {
    
    document.querySelectorAll('.difficulty-button').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    
    document.getElementById(`${level.toLowerCase()}-button`).classList.add('selected');
    
    
    currentDifficulty = DIFFICULTY[level];
    
    
    updateDifficultyDisplay();
}


function setCharacter(type) {
    
    document.querySelectorAll('.character-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    
    document.querySelector(`.character-option[data-character="${type.toLowerCase()}"]`).classList.add('selected');
    
    
    currentCharacter = CHARACTERS[type];
    
    
    updateCharacterDisplay();
}


function updateDifficultyDisplay() {
    const difficultyElement = document.getElementById('difficulty-display');
    difficultyElement.textContent = currentDifficulty.name;
    
    
    difficultyElement.className = '';
    difficultyElement.classList.add(currentDifficulty.name.toLowerCase());
}


function updateCharacterDisplay() {
    const characterElement = document.getElementById('character-display');
    characterElement.textContent = currentCharacter.name;
}


function loadRankings() {
    const savedRankings = localStorage.getItem('spaceShooterRankings');
    if (savedRankings) {
        rankings = JSON.parse(savedRankings);
    } else {
        
        rankings = [];
    }
}


function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * GAME_WIDTH,
            y: Math.random() * GAME_HEIGHT,
            size: Math.random() * 3 + 1,
            speed: Math.random() * 2 + 0.5,
            brightness: Math.random() * 0.8 + 0.2 
        });
    }
}


function startGame() {
    
    updatePlayerName();
    
    document.getElementById('game-start').classList.add('hidden');
    
    
    document.querySelector('.game-info').classList.remove('hidden');
    
    resetGame();
    gameRunning = true;
    requestAnimationFrame(gameLoop);
}


function resetGame() {
    bullets = [];
    enemyBullets = [];
    enemies = [];
    powerUps = [];
    shields = [];
    explosions = [];
    score = 0;
    enemiesDefeated = 0;
    weaponLevel = 1;
    shieldCount = 0;
    enemySpawnInterval = currentDifficulty.enemySpawnIntervalInitial;
    lastEnemySpawnTime = 0;
    
    
    player = {
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT - 100,
        width: 35,
        height: 35,
        color: currentCharacter.color,
        lastFireTime: 0,
        fireRate: currentCharacter.fireRate,
        hasShield: currentCharacter.startWithShield || false
    };
    
    
    if (currentCharacter.startWithShield) {
        shieldCount = 1;
    }
    
    
    updateScoreDisplay();
    updateEnemiesDefeatedDisplay();
    updateWeaponLevelDisplay();
    updateShieldDisplay();
    updateDifficultyDisplay();
    updateCharacterDisplay();
    document.getElementById('player-name-display').textContent = playerName;
    
   
    document.getElementById('game-over').classList.add('hidden');
}


function updateShieldDisplay() {
    document.getElementById('shield-count').textContent = shieldCount;
}


function updateEnemiesDefeatedDisplay() {
    document.getElementById('enemies-defeated').textContent = enemiesDefeated;
}


function gameOver() {
    gameRunning = false;
    
    
    document.getElementById('final-player-name').textContent = playerName;
    document.getElementById('final-score').textContent = score;
    document.getElementById('final-enemies-defeated').textContent = enemiesDefeated;
    document.getElementById('final-difficulty').textContent = currentDifficulty.name;
    document.getElementById('final-character').textContent = currentCharacter.name;
    
    
    document.getElementById('final-difficulty').className = currentDifficulty.name.toLowerCase();
    
    
    addToRankings();
    
    
    displayRankings();
    
    
    document.getElementById('game-over').classList.remove('hidden');
}


function addToRankings() {
    
    const now = new Date();
    const dateStr = `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}`;
    
    
    rankings.push({
        playerName: playerName,
        score: score,
        enemiesDefeated: enemiesDefeated,
        difficulty: currentDifficulty.name,
        character: currentCharacter.name,
        date: dateStr
    });
    
    
    rankings.sort((a, b) => b.score - a.score);
    
    
    if (rankings.length > 10) {
        rankings = rankings.slice(0, 10);
    }
    
    
    localStorage.setItem('spaceShooterRankings', JSON.stringify(rankings));
}


function displayRankings() {
    const rankingsBody = document.getElementById('rankings-body');
    rankingsBody.innerHTML = '';
    
    
    let currentRank = -1;
    for (let i = 0; i < rankings.length; i++) {
        if (rankings[i].score === score && 
            rankings[i].enemiesDefeated === enemiesDefeated && 
            rankings[i].difficulty === currentDifficulty.name &&
            rankings[i].character === currentCharacter.name &&
            rankings[i].playerName === playerName) {
            currentRank = i + 1;
            break;
        }
    }
    
    document.getElementById('ranking-position').textContent = currentRank > 0 ? currentRank : '-';
    
    
    rankings.forEach((rank, index) => {
        const row = document.createElement('tr');
        
        
        if (index + 1 === currentRank) {
            row.classList.add('current-score');
        }
        
        
        const difficultyClass = rank.difficulty ? rank.difficulty.toLowerCase() : 'medium';
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${rank.playerName || DEFAULT_PLAYER_NAME}</td>
            <td>${rank.score}</td>
            <td>${rank.enemiesDefeated}</td>
            <td class="${difficultyClass}">${rank.difficulty || 'Medium'}</td>
            <td>${rank.character || 'Standard'}</td>
            <td>${rank.date}</td>
        `;
        
        rankingsBody.appendChild(row);
    });
}


function restartGame() {
    
    document.getElementById('game-over').classList.add('hidden');
    
    
    document.querySelector('.game-info').classList.add('hidden');
    
    
    document.getElementById('game-start').classList.remove('hidden');
}


function updateScoreDisplay() {
    document.getElementById('score').textContent = score;
}


function updateWeaponLevelDisplay() {
    document.getElementById('weapon-level').textContent = weaponLevel;
}


function drawStars() {
    stars.forEach(star => {
        const opacity = star.brightness;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}


function moveStars() {
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > GAME_HEIGHT) {
            star.y = 0;
            star.x = Math.random() * GAME_WIDTH;
        }
    });
}


function drawExplosions() {
    explosions.forEach(explosion => {
        ctx.globalAlpha = explosion.alpha;
        ctx.fillStyle = explosion.color;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });
}


function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];
        explosion.radius += explosion.speed;
        explosion.alpha -= 0.02;
        
        if (explosion.alpha <= 0) {
            explosions.splice(i, 1);
        }
    }
}


function drawPlayer() {
    
    if (player.hasShield) {
        ctx.beginPath();
        ctx.arc(player.x, player.y + player.height / 2, player.width * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 255, 150, 0.7)';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x - player.width / 2, player.y + player.height);
    ctx.lineTo(player.x + player.width / 2, player.y + player.height);
    ctx.closePath();
    ctx.fill();
}


function drawBullets() {
    bullets.forEach(bullet => {
        
        if (bullet.angle !== undefined && bullet.angle !== 0) {
            ctx.save();
            ctx.translate(bullet.x, bullet.y);
            ctx.rotate(bullet.angle);
            
            
            if (bullet.width >= 8) {
                
                ctx.fillStyle = '#ffff00';
            } else if (bullet.angle !== 0) {
                
                ctx.fillStyle = '#00ffff';
            } else {
                
                ctx.fillStyle = '#ffcc00';
            }
            
            ctx.fillRect(-bullet.width / 2, -bullet.height / 2, bullet.width, bullet.height);
            ctx.restore();
        } else {
            
            if (bullet.width >= 8) {
                
                ctx.fillStyle = '#ffff00';
            } else {
                
                ctx.fillStyle = '#ffcc00';
            }
            ctx.fillRect(bullet.x - bullet.width / 2, bullet.y - bullet.height / 2, bullet.width, bullet.height);
        }
    });
}


function drawEnemyBullets() {
    ctx.fillStyle = '#ff0000';
    enemyBullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}


function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}


function drawPowerUps() {
    
    powerUps.forEach(powerUp => {
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, powerUp.radius, 0, Math.PI * 2);
        ctx.fill();
        
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const x1 = powerUp.x + Math.cos(angle) * (powerUp.radius + 5);
            const y1 = powerUp.y + Math.sin(angle) * (powerUp.radius + 5);
            const x2 = powerUp.x + Math.cos(angle) * (powerUp.radius + 10);
            const y2 = powerUp.y + Math.sin(angle) * (powerUp.radius + 10);
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    });
    
    
    shields.forEach(shield => {
        
        ctx.fillStyle = '#00ff99';
        ctx.beginPath();
        ctx.arc(shield.x, shield.y, shield.radius, 0, Math.PI * 2);
        ctx.fill();
        
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(shield.x, shield.y, shield.radius * 0.7, Math.PI * 0.25, Math.PI * 0.75);
        ctx.stroke();
        
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(shield.x, shield.y, shield.radius + 3, 0, Math.PI * 2);
        ctx.stroke();
    });
}


function movePlayer() {
    if (keys['ArrowLeft'] && player.x > player.width / 2) {
        player.x -= currentCharacter.speed;
    }
    if (keys['ArrowRight'] && player.x < GAME_WIDTH - player.width / 2) {
        player.x += currentCharacter.speed;
    }
}


function fireBullet() {
    const currentTime = Date.now();
    if (keys[' '] && currentTime - player.lastFireTime > player.fireRate) {
        player.lastFireTime = currentTime;
        
        
        const bulletSpeed = currentCharacter.bulletSpeed;
        
        
        const bulletSizeMultiplier = currentCharacter.name === "Power" ? 1.5 : 1;
        
        
        switch (weaponLevel) {
            case 1:
                
                bullets.push({
                    x: player.x,
                    y: player.y,
                    width: 5 * bulletSizeMultiplier,
                    height: 15 * bulletSizeMultiplier,
                    speed: bulletSpeed,
                    angle: 0 
                });
                break;
            case 2:
                
                bullets.push({
                    x: player.x - 10,
                    y: player.y,
                    width: 5 * bulletSizeMultiplier,
                    height: 15 * bulletSizeMultiplier,
                    speed: bulletSpeed,
                    angle: 0
                });
                bullets.push({
                    x: player.x + 10,
                    y: player.y,
                    width: 5 * bulletSizeMultiplier,
                    height: 15 * bulletSizeMultiplier,
                    speed: bulletSpeed,
                    angle: 0
                });
                break;
            case 3:
                
                bullets.push({
                    x: player.x,
                    y: player.y,
                    width: 5 * bulletSizeMultiplier,
                    height: 15 * bulletSizeMultiplier,
                    speed: bulletSpeed,
                    angle: 0
                });
                bullets.push({
                    x: player.x - 15,
                    y: player.y + 10,
                    width: 5 * bulletSizeMultiplier,
                    height: 15 * bulletSizeMultiplier,
                    speed: bulletSpeed,
                    angle: 0
                });
                bullets.push({
                    x: player.x + 15,
                    y: player.y + 10,
                    width: 5 * bulletSizeMultiplier,
                    height: 15 * bulletSizeMultiplier,
                    speed: bulletSpeed,
                    angle: 0
                });
                break;
            case 4:
                
                bullets.push({
                    x: player.x - 5,
                    y: player.y,
                    width: 8 * bulletSizeMultiplier,
                    height: 20 * bulletSizeMultiplier,
                    speed: bulletSpeed + 2,
                    angle: 0
                });
                bullets.push({
                    x: player.x + 5,
                    y: player.y,
                    width: 8 * bulletSizeMultiplier,
                    height: 20 * bulletSizeMultiplier,
                    speed: bulletSpeed + 2,
                    angle: 0
                });
                bullets.push({
                    x: player.x - 20,
                    y: player.y + 10,
                    width: 5 * bulletSizeMultiplier,
                    height: 15 * bulletSizeMultiplier,
                    speed: bulletSpeed,
                    angle: 0
                });
                bullets.push({
                    x: player.x + 20,
                    y: player.y + 10,
                    width: 5 * bulletSizeMultiplier,
                    height: 15 * bulletSizeMultiplier,
                    speed: bulletSpeed,
                    angle: 0
                });
                break;
            case 5:
                
                bullets.push({
                    x: player.x,
                    y: player.y,
                    width: 10 * bulletSizeMultiplier,
                    height: 25 * bulletSizeMultiplier,
                    speed: bulletSpeed + 3,
                    angle: 0
                });
                
                bullets.push({
                    x: player.x - 15,
                    y: player.y + 5,
                    width: 6 * bulletSizeMultiplier,
                    height: 18 * bulletSizeMultiplier,
                    speed: bulletSpeed + 1,
                    angle: 0
                });
                bullets.push({
                    x: player.x + 15,
                    y: player.y + 5,
                    width: 6 * bulletSizeMultiplier,
                    height: 18 * bulletSizeMultiplier,
                    speed: bulletSpeed + 1,
                    angle: 0
                });
                
                bullets.push({
                    x: player.x - 25,
                    y: player.y + 10,
                    width: 5 * bulletSizeMultiplier,
                    height: 15 * bulletSizeMultiplier,
                    speed: bulletSpeed,
                    angle: -0.3 
                });
                bullets.push({
                    x: player.x + 25,
                    y: player.y + 10,
                    width: 5 * bulletSizeMultiplier,
                    height: 15 * bulletSizeMultiplier,
                    speed: bulletSpeed,
                    angle: 0.3 
                });
                break;
        }
    }
}


function moveBullets() {
    bullets = bullets.filter(bullet => {
        
        if (bullet.angle !== undefined) {
            bullet.x += Math.sin(bullet.angle) * bullet.speed;
            bullet.y -= Math.cos(bullet.angle) * bullet.speed;
        } else {
            
            bullet.y -= bullet.speed;
        }
        
        
        return bullet.y + bullet.height > 0 && 
               bullet.x + bullet.width / 2 > 0 && 
               bullet.x - bullet.width / 2 < GAME_WIDTH;
    });
}


function moveEnemyBullets() {
    enemyBullets = enemyBullets.filter(bullet => {
        bullet.y += bullet.speed;
        return bullet.y - bullet.radius < GAME_HEIGHT;
    });
}


function spawnEnemy(currentTime) {
    if (currentTime - lastEnemySpawnTime > enemySpawnInterval) {
        lastEnemySpawnTime = currentTime;
        
        
        enemySpawnInterval = Math.max(
            currentDifficulty.enemySpawnIntervalMin, 
            enemySpawnInterval * currentDifficulty.enemySpawnDecreaseRate
        );
        
        
        const r = Math.floor(Math.random() * 155) + 100;
        const g = Math.floor(Math.random() * 155) + 100;
        const b = Math.floor(Math.random() * 155) + 100;
        const color = `rgb(${r}, ${g}, ${b})`;
        
        
        const radius = Math.random() * 15 + 10; 
        const speed = Math.random() * 
            (currentDifficulty.enemySpeedMax - currentDifficulty.enemySpeedMin) + 
            currentDifficulty.enemySpeedMin;
        
        
        const movementType = Math.floor(Math.random() * 3); 
        const horizontalSpeed = (Math.random() * 2 + 1) * (movementType === 1 ? -1 : movementType === 2 ? 1 : 0);
        
        
        const health = radius > BIG_ENEMY_THRESHOLD ? 2 : 1;
        
        enemies.push({
            x: Math.random() * (GAME_WIDTH - radius * 2) + radius,
            y: -radius,
            radius: radius,
            color: color,
            speed: speed,
            horizontalSpeed: horizontalSpeed,
            health: health 
        });
    }
}


function moveEnemies() {
    enemies.forEach(enemy => {
        enemy.y += enemy.speed;
        
        
        if (enemy.horizontalSpeed) {
            enemy.x += enemy.horizontalSpeed;
            
            
            if (enemy.x - enemy.radius < 0 || enemy.x + enemy.radius > GAME_WIDTH) {
                enemy.horizontalSpeed *= -1;
            }
        }
        
        
        if (Math.random() < currentDifficulty.enemyFireChance) {
            enemyBullets.push({
                x: enemy.x,
                y: enemy.y + enemy.radius,
                radius: 5,
                speed: currentDifficulty.enemyBulletSpeed
            });
        }
    });
    
    
    enemies = enemies.filter(enemy => enemy.y - enemy.radius < GAME_HEIGHT);
}


function movePowerUps() {
    powerUps.forEach(powerUp => {
        powerUp.y += powerUp.speed;
    });
    
    
    powerUps = powerUps.filter(powerUp => powerUp.y - powerUp.radius < GAME_HEIGHT);
}


function moveShields() {
    shields.forEach(shield => {
        shield.y += shield.speed;
    });
    
    
    shields = shields.filter(shield => shield.y - shield.radius < GAME_HEIGHT);
}


function checkCollisions() {
   
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < enemy.radius + player.width / 2) {
            if (player.hasShield) {
                
                player.hasShield = false;
                
                
                createExplosion(enemy.x, enemy.y, enemy.color);
                enemies.splice(i, 1);
                
                
                enemiesDefeated++;
                updateEnemiesDefeatedDisplay();
                
                
                createShieldBreakEffect(player.x, player.y);
            } else {
                gameOver();
            }
            return;
        }
    }
    
    
    for (let i = 0; i < enemyBullets.length; i++) {
        const bullet = enemyBullets[i];
        const dx = player.x - bullet.x;
        const dy = player.y - bullet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < bullet.radius + player.width / 3) {
            if (player.hasShield) {
               
                player.hasShield = false;
                
                
                enemyBullets.splice(i, 1);
                
                
                createShieldBreakEffect(player.x, player.y);
            } else {
                gameOver();
            }
            return;
        }
    }
    
    
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            const dx = bullet.x - enemy.x;
            const dy = bullet.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < enemy.radius + bullet.width / 2) {
                
                enemy.health--;
                
                
                bullets.splice(i, 1);
                
                
                createSmallExplosion(bullet.x, bullet.y, enemy.color);
                
                
                if (enemy.health <= 0) {
                    
                    score += Math.floor(enemy.radius * currentDifficulty.scoreMultiplier);
                    updateScoreDisplay();
                    
                    
                    enemiesDefeated++;
                    updateEnemiesDefeatedDisplay();
                    
                    
                    createExplosion(enemy.x, enemy.y, enemy.color);
                    
                    
                    if (Math.random() < currentDifficulty.weaponDropChance && weaponLevel < MAX_WEAPON_LEVEL) {
                        
                        powerUps.push({
                            x: enemy.x,
                            y: enemy.y,
                            radius: 10,
                            speed: 2,
                            type: 'weapon'
                        });
                    }
                    
                    
                    if (enemy.radius > BIG_ENEMY_THRESHOLD && Math.random() < currentDifficulty.shieldDropChance) {
                        
                        shields.push({
                            x: enemy.x,
                            y: enemy.y,
                            radius: 12,
                            speed: 1.5,
                            type: 'shield'
                        });
                    }
                    
                    
                    enemies.splice(j, 1);
                }
                break;
            }
        }
    }
    
    
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        const dx = player.x - powerUp.x;
        const dy = player.y - powerUp.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < powerUp.radius + player.width / 2) {
            
            if (weaponLevel < MAX_WEAPON_LEVEL) {
                weaponLevel++;
                updateWeaponLevelDisplay();
                
               
                createPowerUpEffect(player.x, player.y);
            }
            
            
            powerUps.splice(i, 1);
        }
    }
    
    
    for (let i = shields.length - 1; i >= 0; i--) {
        const shield = shields[i];
        const dx = player.x - shield.x;
        const dy = player.y - shield.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < shield.radius + player.width / 2) {
            
            if (!player.hasShield) {
                player.hasShield = true;
                shieldCount++;
                updateShieldDisplay();
                
               
                createShieldEffect(player.x, player.y);
            }
            
            
            shields.splice(i, 1);
        }
    }
}


function createSmallExplosion(x, y, color) {
    explosions.push({
        x: x,
        y: y,
        radius: 3,
        speed: 1,
        alpha: 0.8,
        color: color
    });
}


function createPowerUpEffect(x, y) {
    
    for (let i = 0; i < 2; i++) {
        explosions.push({
            x: x,
            y: y,
            radius: 10 + i * 15,
            speed: 2,
            alpha: 0.7,
            color: '#00ffff'
        });
    }
}


function createShieldEffect(x, y) {
    
    explosions.push({
        x: x,
        y: y,
        radius: 30,
        speed: 1.5,
        alpha: 0.5,
        color: '#00ff99'
    });
}


function createShieldBreakEffect(x, y) {
    
    for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 30 + 10;
        const fragmentX = x + Math.cos(angle) * distance;
        const fragmentY = y + Math.sin(angle) * distance;
        
        explosions.push({
            x: fragmentX,
            y: fragmentY,
            radius: Math.random() * 4 + 2,
            speed: Math.random() * 1 + 0.5,
            alpha: Math.random() * 0.5 + 0.5,
            color: '#00ff99'
        });
    }
}


function createExplosion(x, y, color) {
    
    explosions.push({
        x: x,
        y: y,
        radius: 5,
        speed: 2,
        alpha: 1,
        color: color
    });
    
   
    const fragmentCount = Math.floor(Math.random() * 5) + 5;
    for (let i = 0; i < fragmentCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 20 + 10;
        const fragmentX = x + Math.cos(angle) * distance;
        const fragmentY = y + Math.sin(angle) * distance;
        
        explosions.push({
            x: fragmentX,
            y: fragmentY,
            radius: Math.random() * 3 + 2,
            speed: Math.random() * 1 + 0.5,
            alpha: Math.random() * 0.5 + 0.5,
            color: color
        });
    }
}


function gameLoop(timestamp) {
    if (!gameRunning) return;
    
    
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    
    drawStars();
    moveStars();
    
    
    movePlayer();
    drawPlayer();
    
    
    fireBullet();
    moveBullets();
    drawBullets();
    
    
    spawnEnemy(timestamp);
    moveEnemies();
    drawEnemies();
    
    
    moveEnemyBullets();
    drawEnemyBullets();
    
    
    movePowerUps();
    moveShields();
    drawPowerUps();
    
    
    updateExplosions();
    drawExplosions();
    
    
    checkCollisions();
    
    
    requestAnimationFrame(gameLoop);
}


window.addEventListener('load', initGame);
