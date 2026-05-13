const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridTargetSize = 20;
const tileCount = canvas.width / gridTargetSize;

let snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
let food = { x: 15, y: 7 };
let dx = 1;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snake_high_score') || 0;
let gameInterval;
const gameSpeed = 100; 

document.getElementById('highScore').innerText = highScore;

// 遊戲主迴圈
function main() {
    if (hasGameEnded()) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ff007f";
        ctx.font = "bold 24px 'Segoe UI'";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snake_high_score', highScore);
            document.getElementById('highScore').innerText = highScore;
        }
        return;
    }

    clearCanvas();
    drawGrid();
    drawFood();
    moveSnake();
    drawSnake();
}

// 建立定時器
function startGame() {
    clearInterval(gameInterval);
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    score = 0;
    document.getElementById('score').innerText = score;
    dx = 1;
    dy = 0;
    generateFood();
    gameInterval = setInterval(main, gameSpeed);
}

function clearCanvas() {
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 繪製背景復古網格
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += gridTargetSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
}

// 繪製霓虹發光的蛇
function drawSnake() {
    snake.forEach((part, index) => {
        const isHead = index === 0;
        
        // 設定霓虹發光效果
        ctx.shadowBlur = 10;
        ctx.shadowColor = isHead ? '#00f0ff' : '#00a3ff';
        ctx.fillStyle = isHead ? '#00f0ff' : 'rgba(0, 163, 255, ' + (1 - index/snake.length * 0.6) + ')';
        
        // 畫出圓角蛇身
        const x = part.x * gridTargetSize;
        const y = part.y * gridTargetSize;
        const r = isHead ? 6 : 4; // 圓角半徑
        
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, gridTargetSize - 2, gridTargetSize - 2, r);
        ctx.fill();
        
        // 幫蛇頭點綴個小眼睛
        if (isHead) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#070913';
            ctx.beginPath();
            ctx.arc(x + 12, y + 8, 2, 0, 2 * Math.PI);
            ctx.fill();
        }
    });
    ctx.shadowBlur = 0; // 還原陰影設定
}

// 繪製蘋果（寶箱霓虹風）
function drawFood() {
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff007f';
    
    // 漸層色食物
    let gradient = ctx.createRadialGradient(
        food.x * gridTargetSize + 10, food.y * gridTargetSize + 10, 2,
        food.x * gridTargetSize + 10, food.y * gridTargetSize + 10, 10
    );
    gradient.addColorStop(0, '#ff66b2');
    gradient.addColorStop(1, '#ff007f');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(food.x * gridTargetSize + 2, food.y * gridTargetSize + 2, gridTargetSize - 4, gridTargetSize - 4, 5);
    ctx.fill();
    
    ctx.shadowBlur = 0;
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (snake[0].x === food.x && snake[0].y === food.y) {
        score += 10;
        document.getElementById('score').innerText = score;
        generateFood();
    } else {
        snake.pop();
    }
}

function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    // 確保食物不會生在蛇身上
    snake.forEach(part => {
        if (part.x === food.x && part.y === food.y) generateFood();
    });
}

function hasGameEnded() {
    // 撞牆判定
    if (snake[0].x < 0 || snake[0].x >= tileCount || snake[0].y < 0 || snake[0].y >= tileCount) return true;
    // 撞自己判定
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }
    return false;
}

// 鍵盤控制（保留電腦遊玩彈性）
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -1; }
    if (e.key === 'ArrowDown' && dy === 0) { dx = 0; dy = 1; }
    if (e.key === 'ArrowLeft' && dx === 0) { dx = -1; dy = 0; }
    if (e.key === 'ArrowRight' && dx === 0) { dx = 1; dy = 0; }
});

// 綁定虛擬按鈕點擊事件
document.getElementById('btn-up').addEventListener('click', () => { if (dy === 0) { dx = 0; dy = -1; } });
document.getElementById('btn-down').addEventListener('click', () => { if (dy === 0) { dx = 0; dy = 1; } });
document.getElementById('btn-left').addEventListener('click', () => { if (dx === 0) { dx = -1; dy = 0; } });
document.getElementById('btn-right').addEventListener('click', () => { if (dx === 0) { dx = 1; dy = 0; } });
document.getElementById('btn-restart').addEventListener('click', startGame);

startGame();
