const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player = {
    x: 370,
    y: 420,
    width: 60,
    height: 60,
    speed: 7,
    color: "#00ffff"
};

let bullets = [];
let enemies = [];
let particles = [];
let keys = {};
let score = 0;
let highScore = localStorage.getItem("spaceHighScore") || 0;
let gameOver = false;
let frame = 0;

function drawBackground() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 120; i++) {
        ctx.fillStyle = "white";
        ctx.fillRect((i * 70 + frame) % canvas.width, (i * 40) % canvas.height, 2, 2);
    }
}

function drawPlayer() {
    ctx.save();

    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 25;

    // Main Ship Body
    const gradient = ctx.createLinearGradient(player.x, player.y, player.x, player.y + player.height);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.5, "#00ffff");
    gradient.addColorStop(1, "#0044ff");

    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width / 2, player.y + player.height - 15);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle = "#99ffff";
    ctx.beginPath();
    ctx.ellipse(player.x + player.width / 2, player.y + 20, 10, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Left Wing
    ctx.fillStyle = "#00aaff";
    ctx.fillRect(player.x - 8, player.y + 35, 15, 8);

    // Right Wing
    ctx.fillRect(player.x + player.width - 7, player.y + 35, 15, 8);

    // Engine Flames
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.moveTo(player.x + 15, player.y + player.height);
    ctx.lineTo(player.x + 22, player.y + player.height + Math.random() * 20);
    ctx.lineTo(player.x + 28, player.y + player.height);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(player.x + player.width - 28, player.y + player.height);
    ctx.lineTo(player.x + player.width - 22, player.y + player.height + Math.random() * 20);
    ctx.lineTo(player.x + player.width - 15, player.y + player.height);
    ctx.fill();

    ctx.restore();
}

function movePlayer() {
    if (keys["ArrowLeft"] && player.x > 0) {
        player.x -= player.speed;
    }

    if (keys["ArrowRight"] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
}

function shootBullet() {
    bullets.push({
        x: player.x + player.width / 2 - 3,
        y: player.y,
        width: 6,
        height: 20,
        speed: 10
    });
}

function drawBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;

        ctx.fillStyle = "#00ff00";
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });
}

function createEnemy() {
    const size = Math.random() * 30 + 40;

    enemies.push({
        x: Math.random() * (canvas.width - size),
        y: -size,
        width: size,
        height: size,
        speed: Math.random() * 3 + 2,
        color: "#ff0055"
    });
}

function drawEnemies() {
    enemies.forEach((enemy, enemyIndex) => {
        enemy.y += enemy.speed;

        ctx.save();

        ctx.shadowColor = enemy.color;
        ctx.shadowBlur = 20;

        // Enemy Ship Body
        const enemyGradient = ctx.createLinearGradient(enemy.x, enemy.y, enemy.x, enemy.y + enemy.height);
        enemyGradient.addColorStop(0, "#ff99aa");
        enemyGradient.addColorStop(1, enemy.color);

        ctx.fillStyle = enemyGradient;

        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
        ctx.lineTo(enemy.x, enemy.y);
        ctx.lineTo(enemy.x + enemy.width / 2, enemy.y + 20);
        ctx.lineTo(enemy.x + enemy.width, enemy.y);
        ctx.closePath();
        ctx.fill();

        // Enemy Eye
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width / 2, enemy.y + 18, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        if (enemy.y > canvas.height) {
            gameOver = true;
        }

        bullets.forEach((bullet, bulletIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                createExplosion(enemy.x, enemy.y);

                enemies.splice(enemyIndex, 1);
                bullets.splice(bulletIndex, 1);

                score++;

                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem("spaceHighScore", highScore);
                }
            }
        });

        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            gameOver = true;
        }
    });
}

function createExplosion(x, y) {
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 5,
            speedX: Math.random() * 6 - 3,
            speedY: Math.random() * 6 - 3,
            life: 30
        });
    }
}

function drawParticles() {
    particles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life--;

        ctx.fillStyle = "orange";
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);

        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });
}

function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "22px Arial";
    ctx.fillText("Score: " + score, 20, 40);
    ctx.fillText("High Score: " + highScore, 20, 70);
}

function drawGameOver() {
    ctx.fillStyle = "red";
    ctx.font = "45px Arial";
    ctx.fillText("GAME OVER", 240, 220);

    ctx.font = "24px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Press R to Restart", 280, 270);
}

function restartGame() {
    bullets = [];
    enemies = [];
    particles = [];
    score = 0;
    gameOver = false;

    gameLoop();
}

function gameLoop() {
    frame++;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    drawPlayer();
    movePlayer();
    drawBullets();
    drawEnemies();
    drawParticles();
    drawScore();

    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    } else {
        drawGameOver();
    }
}

setInterval(() => {
    if (!gameOver) {
        createEnemy();
    }
}, 1000);

window.addEventListener("keydown", (e) => {
    keys[e.key] = true;

    if (e.code === "Space") {
        shootBullet();
    }

    if (e.code === "KeyR" && gameOver) {
        restartGame();
    }
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

gameLoop();