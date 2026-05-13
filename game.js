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

// 按鍵指令緩衝佇列：完美防範快速連按導致的原地回頭逆向自殺 Bug
let inputQueue = [];

// 初始化網頁上的最高分數
document.getElementById('highScore').innerText = highScore;

function main() {
    // 每一幀只消耗一個方向移動指令
    if (inputQueue.length > 0) {
        const nextMove = inputQueue.shift();
        // 嚴格防止 180 度原地逆向
        if ((nextMove.dx !== 0 && dx === 0) || (nextMove.dy !== 0 && dy === 0)) {
            dx = nextMove.dx;
            dy = nextMove.dy;
        }
    }

    if (hasGameEnded()) {
        handleGameOver();
        return;
    }

    clearCanvas();
    drawGrid();
    drawFood();
    moveSnake();
    drawSnake();
}

function startGame() {
    clearInterval(gameInterval);
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    score = 0;
    
    // 【精準修正】重設網頁 DOM 的即時分數
    document.getElementById('score').innerText = score;
    
    dx = 1;
    dy = 0;
    inputQueue = []; 
    generateFood();
    gameInterval = setInterval(main, gameSpeed);
}

function clearCanvas() {
    ctx.fillStyle = '#070a12'; // 深邃科技黑底
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 繪製高級雷射微光網格
function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.025)'; // 微弱的青色線條
    ctx.lineWidth = 1;
    for (let i = 0; i <= canvas.width; i += gridTargetSize) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }
}

// 繪製極光流暢漸層霓虹蛇
function drawSnake() {
    snake.forEach((part, index) => {
        const isHead = index === 0;
        const x = part.x * gridTargetSize;
        const y = part.y * gridTargetSize;
        const r = isHead ? 7 : 4; // 頭部較圓潤，身子帶微圓角

        // 啟用原生 Canvas 物理發光特效 (Shadow Rendering)
        ctx.shadowBlur = isHead ? 15 : 8;
        ctx.shadowColor = isHead ? '#00f0ff' : '#00a3ff';
        
        // 漸層色彩：蛇身會隨著長度產生由亮到暗的流體質感
        ctx.fillStyle = isHead ? '#00f0ff' : `rgba(0, 163, 255, ${1 - (index / snake.length) * 0.6})`;
        
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, gridTargetSize - 2, gridTargetSize - 2, r);
        ctx.fill();
        
        // 精緻化蛇頭：生動的前進雙眼
        if (isHead) {
            ctx.shadowBlur = 0; // 眼睛不發光
            ctx.fillStyle = '#060914';
            
            // 依前進方向微調眼神位置
            let eyeX1 = x + 10, eyeY1 = y + 10;
            let eyeX2 = x + 10, eyeY2 = y + 10;
            
            if (dx === 1)  { eyeX1 = x + 13; eyeY1 = y + 6;  eyeX2 = x + 13; eyeY2 = y + 14; }
            if (dx === -1) { eyeX1 = x + 7;  eyeY1 = y + 6;  eyeX2 = x + 7;  eyeY2 = y + 14; }
            if (dy === 1)  { eyeX1 = x + 6;  eyeY1 = y + 13; eyeX2 = x + 14; eyeY2 = y + 13; }
            if (dy === -1) { eyeX1 = x + 6;  eyeY1 = y + 7;  eyeX2 = x + 14; eyeY2 = y + 7; }
            
            ctx.beginPath(); ctx.arc(eyeX1, eyeY1, 2, 0, 2 * Math.PI); ctx.fill();
            ctx.beginPath(); ctx.arc(eyeX2, eyeY2, 2, 0, 2 * Math.PI); ctx.fill();
        }
    });
    ctx.shadowBlur = 0; // 繪製完後立刻重置陰影，避免效能下滑
}

// 繪製賽博朋克放射發光能量晶體 (食物)
function drawFood() {
    const x = food.x * gridTargetSize;
    const y = food.y * gridTargetSize;

    ctx.shadowBlur = 18;
    ctx.shadowColor = '#ff007f'; // 經典桃紅發光
    
    let gradient = ctx.createRadialGradient(
        x + 10, y + 10, 1,
        x + 10, y + 10, 10
    );
    gradient.addColorStop(0, '#ffffff');  // 核心亮白高光
    gradient.addColorStop(0.3, '#ff66b2');
    gradient.addColorStop(1, '#ff007f');  // 邊緣飽和桃紅
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, gridTargetSize - 4, gridTargetSize - 4, 6);
    ctx.fill();
    
    ctx.shadowBlur = 0;
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    // 【分數邏輯修正】當頭部與食物座標完全重疊
    if (snake[0].x === food.x && snake[0].y === food.y) {
        score += 10; 
        document.getElementById('score').innerText = score; // 【核心修正】實時把新分數寫回前端網頁
        generateFood();
    } else {
        snake.pop();
    }
}

function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    
    // 用普通的 for 迴圈做嚴格重疊檢查，防止產生在蛇身內部
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === food.x && snake[i].y === food.y) {
            generateFood();
            return;
        }
    }
}

function hasGameEnded() {
    if (snake[0].x < 0 || snake[0].x >= tileCount || snake[0].y < 0 || snake[0].y >= tileCount) return true;
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }
    return false;
}

function handleGameOver() {
    ctx.fillStyle = "rgba(7, 10, 18, 0.85)"; // 壓暗背景
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Game Over 特效文字
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff007f';
    ctx.fillStyle = "#ff007f";
    ctx.font = "bold 28px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 10);
    
    // 提示文字
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#8a99ad";
    ctx.font = "14px 'Segoe UI', sans-serif";
    ctx.fillText("點擊重新開始按鈕再次挑戰", canvas.width / 2, canvas.height / 2 + 25);

    // 處理最高分數儲存與即時連動
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snake_high_score', highScore);
        document.getElementById('highScore').innerText = highScore;
    }
}

// 接收按鍵並推入安全佇列
function pushDirection(newDx, newDy) {
    const lastMove = inputQueue.length > 0 ? inputQueue[inputQueue.length - 1] : { dx, dy };
    if ((newDx !== 0 && lastMove.dx === 0) || (newDy !== 0 && lastMove.dy === 0)) {
        inputQueue.push({ dx: newDx, dy: newDy });
    }
}

// 實體鍵盤監聽
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') pushDirection(0, -1);
    if (e.key === 'ArrowDown') pushDirection(0, 1);
    if (e.key === 'ArrowLeft') pushDirection(-1, 0);
    if (e.key === 'ArrowRight') pushDirection(1, 0);
});

// 手機虛擬鍵盤事件監聽
document.getElementById('btn-up').addEventListener('click', () => pushDirection(0, -1));
document.getElementById('btn-down').addEventListener('click', () => pushDirection(0, 1));
document.getElementById('btn-left').addEventListener('click', () => pushDirection(-1, 0));
document.getElementById('btn-right').addEventListener('click', () => pushDirection(1, 0));
document.getElementById('btn-restart').addEventListener('click', startGame);

startGame();
