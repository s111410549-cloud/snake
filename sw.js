const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
let food = { x: 15, y: 10 };
let dx = 1;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snake_pwa_high') || 0;
let gameInterval;
let inputQueue = []; // 用來存放按鍵指令的佇列，解決連續快速按鍵導致自殺的Bug

document.getElementById('highScore').innerText = highScore;

function main() {
    // 處理輸入佇列：每幀只消耗一個方向指令
    if (inputQueue.length > 0) {
        const nextMove = inputQueue.shift();
        // 防止原地逆向
        if ((nextMove.dx !== 0 && dx === 0) || (nextMove.dy !== 0 && dy === 0)) {
            dx = nextMove.dx;
            dy = nextMove.dy;
        }
    }

    if (checkGameOver()) {
        handleGameOver();
        return;
    }

    clearCanvas();
    drawGrid();
    moveSnake();
    drawFood();
    drawSnake();
}

function startGame() {
    clearInterval(gameInterval);
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    score = 0;
    dx = 1;
    dy = 0;
    inputQueue = [];
    document.getElementById('score').innerText = score;
    generateFood();
    gameInterval = setInterval(main, 110); // 微調速度，體感更舒適
}

function clearCanvas() {
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 繪製高質感低對比背景網格
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= canvas.width; i += gridSize) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }
}

// 漸層色且帶有圓角的蛇身
function drawSnake() {
    snake.forEach((part, index) => {
        const isHead = index === 0;
        const x = part.x * gridSize;
        const y = part.y * gridSize;
        
        // 蛇身顏色從亮藍色漸變到深藍
        ctx.fillStyle = isHead ? '#38bdf8' : `rgba(14, 165, 233, ${1 - (index / snake.length) * 0.5})`;
        
        ctx.beginPath();
        // 頭部用大圓角，身體小圓角
        const radius = isHead ? 8 : 4;
        ctx.roundRect(x + 1, y + 1, gridSize - 2, gridSize - 2, radius);
        ctx.fill();

        // 幫蛇頭精緻化：點綴眼睛與方向感
        if (isHead) {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            // 根據目前移動方向調整眼睛位置
            let eyeX = x + 10, eyeY = y + 10;
            if (dx === 1)  { eyeX = x + 13; eyeY = y + 6; }
            if (dx === -1) { eyeX = x + 7;  eyeY = y + 6; }
            if (dy === 1)  { eyeX = x + 6;  eyeY = y + 13; }
            if (dy === -1) { eyeX = x + 6;  eyeY = y + 7; }
            ctx.arc(eyeX, eyeY, 2.5, 0, 2 * Math.PI);
            ctx.fill();
        }
    });
}

// 繪製多調性發光的食物
function drawFood() {
    const x = food.x * gridSize;
    const y = food.y * gridSize;

    ctx.fillStyle = '#f43f5e'; // 質感玫瑰紅
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, gridSize - 4, gridSize - 4, 6);
    ctx.fill();
    
    // 微亮點綴
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + 6, y + 6, 1.5, 0, 2 * Math.PI);
    ctx.fill();
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
    // 避免生在蛇身上
    for (let part of snake) {
        if (part.x === food.x && part.y === food.y) {
            generateFood();
            break;
        }
    }
}

function checkGameOver() {
    const head = snake[0];
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) return true;
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) return true;
    }
    return false;
}

function handleGameOver() {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('遊戲結束', canvas.width / 2, canvas.height / 2 - 10);
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('點擊 ↻ 重新開始', canvas.width / 2, canvas.height / 2 + 20);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snake_pwa_high', highScore);
        document.getElementById('highScore').innerText = highScore;
    }
}

// 處理方向改變並推入佇列
function changeDirection(newDx, newDy) {
    const lastMove = inputQueue.length > 0 ? inputQueue[inputQueue.length - 1] : { dx, dy };
    // 禁止直接疊加完全相反的方向指令
    if ((newDx !== 0 && lastMove.dx === 0) || (newDy !== 0 && lastMove.dy === 0)) {
        inputQueue.push({ dx: newDx, dy: newDy });
    }
}

// 實體鍵盤綁定
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') changeDirection(0, -1);
    if (e.key === 'ArrowDown') changeDirection(0, 1);
    if (e.key === 'ArrowLeft') changeDirection(-1, 0);
    if (e.key === 'ArrowRight') changeDirection(1, 0);
});

// 虛擬鍵盤綁定
document.getElementById('btn-up').addEventListener('click', () => changeDirection(0, -1));
document.getElementById('btn-down').addEventListener('click', () => changeDirection(0, 1));
document.getElementById('btn-left').addEventListener('click', () => changeDirection(-1, 0));
document.getElementById('btn-right').addEventListener('click', () => changeDirection(1, 0));
document.getElementById('btn-restart').addEventListener('click', startGame);

startGame();
