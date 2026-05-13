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

// 緩衝佇列：防止快速連續按鍵時，蛇原地轉頭自殺
let inputQueue = [];

document.getElementById('highScore').innerText = highScore;

// 遊戲主迴圈
function main() {
    // 每幀只消耗一個方向指令
    if (inputQueue.length > 0) {
        const nextMove = inputQueue.shift();
        // 確保新方向不會與當前方向完全相反（防自殺判定）
        if ((nextMove.dx !== 0 && dx === 0) || (nextMove.dy !== 0 && dy === 0)) {
            dx = nextMove.dx;
            dy = nextMove.dy;
        }
    }

    if (hasGameEnded()) {
        ctx.fillStyle = "rgba(13, 17, 23, 0.75)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#ff007f";
        ctx.font = "bold 26px 'Segoe UI', sans-serif";
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
    inputQueue = []; // 清空按鍵緩衝
    generateFood();
    gameInterval = setInterval(main, gameSpeed);
}

function clearCanvas() {
    ctx.fillStyle = '#0d1117'; // 深邃黑底色
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 繪製高級感極細網格
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'; // 降低對比，極隱約的網格
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += gridTargetSize) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }
}

// 繪製高質感、有發光漸層的蛇身
function drawSnake() {
    snake.forEach((part, index) => {
        const isHead = index === 0;
        
        // 開啟 Canvas 原生霓虹發光特效
        ctx.shadowBlur = 12;
        ctx.shadowColor = isHead ? '#00f0ff' : '#00a3ff';
        
        // 蛇身顏色漸變：從亮藍色一路隨長度淡化，質感大提升
        ctx.fillStyle = isHead ? '#00f0ff' : `rgba(0, 163, 255, ${1 - index / snake.length * 0.6})`;
        
        const x = part.x * gridTargetSize;
        const y = part.y * gridTargetSize;
        const r = isHead ? 6 : 4; // 圓角外觀
        
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, gridTargetSize - 2, gridTargetSize - 2, r);
        ctx.fill();
        
        // 幫蛇頭點綴個小眼睛，並隨著前進方向微調位置
        if (isHead) {
            ctx.shadowBlur = 0; // 眼睛不發光
            ctx.fillStyle = '#070913';
            ctx.beginPath();
            let eyeX = x + 10, eyeY = y + 10;
            if (dx === 1)  { eyeX = x + 13; eyeY = y + 7; }
            if (dx === -1) { eyeX = x + 7;  eyeY = y + 7; }
            if (dy === 1)  { eyeX = x + 7;  eyeY = y + 13; }
            if (dy === -1) { eyeX = x + 7;  eyeY = y + 7; }
            ctx.arc(eyeX, eyeY, 2.2, 0, 2 * Math.PI);
            ctx.fill();
        }
    });
    ctx.shadowBlur = 0; // 關閉發光，避免影響其他元件
}

// 繪製發光寶箱風食物
function drawFood() {
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff007f';
    
    let gradient = ctx.createRadialGradient(
        food.x * gridTargetSize + 10, food.y * gridTargetSize + 10, 2,
        food.x * gridTargetSize + 10, food.y * gridTargetSize + 10, 10
    );
    gradient.addColorStop(0, '#ff66b2');
    gradient.addColorStop(1, '#ff007f');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(food.x * gridTargetSize + 2, food.y * gridTargetSize + 2, gridTargetSize - 4, gridTargetSize - 4, 6);
    ctx.fill();
    
    ctx.shadowBlur = 0;
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (snake[0].x === food.x && snake[0].y === food.y) {
        score += 10;
        document.getElementById('score').innerText = score; // 即時更新網頁分數計算
        generateFood();
    } else {
        snake.pop();
    }
}

function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    snake.forEach(part => {
        if (part.x === food.x && part.y === food.y) generateFood();
    });
}

function hasGameEnded() {
    if (snake[0].x < 0 || snake[0].x >= tileCount || snake[0].y < 0 || snake[0].y >= tileCount) return true;
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }
    return false;
}

// 指令推入佇列
function changeDirection(newDx, newDy) {
    const lastPlanned = inputQueue.length > 0 ? inputQueue[inputQueue.length - 1] : { dx, dy };
    if ((newDx !== 0 && lastPlanned.dx === 0) || (newDy !== 0 && lastPlanned.dy === 0)) {
        inputQueue.push({ dx: newDx, dy: newDy });
    }
}

// 實體與虛擬鍵盤統一走佇列控制
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') changeDirection(0, -1);
    if (e.key === 'ArrowDown') changeDirection(0, 1);
    if (e.key === 'ArrowLeft') changeDirection(-1, 0);
    if (e.key === 'ArrowRight') changeDirection(1, 0);
});

document.getElementById('btn-up').addEventListener('click', () => changeDirection(0, -1));
document.getElementById('btn-down').addEventListener('click', () => changeDirection(0, 1));
document.getElementById('btn-left').addEventListener('click', () => changeDirection(-1, 0));
document.getElementById('btn-right').addEventListener('click', () => changeDirection(1, 0));
document.getElementById('btn-restart').addEventListener('click', startGame);

startGame();
