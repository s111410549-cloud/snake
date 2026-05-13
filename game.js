const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const messageEl = document.getElementById('message');
const pauseBtn = document.getElementById('pauseBtn');
const controls = {
  up: document.getElementById('upBtn'),
  down: document.getElementById('downBtn'),
  left: document.getElementById('leftBtn'),
  right: document.getElementById('rightBtn'),
};

const gridSize = 20;
const tileCount = 20;
const speed = 100;
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let snake = [{ x: 10, y: 10 }];
let apple = { x: 15, y: 10 };
let score = 0;
let running = false;
let paused = false;
let gameLoopId = null;

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  paused = false;
  placeApple();
  updateScore();
  messageEl.textContent = '點擊方向鍵開始遊戲';
}

function placeApple() {
  apple = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount),
  };

  if (snake.some(part => part.x === apple.x && part.y === apple.y)) {
    placeApple();
  }
}

function updateScore() {
  scoreEl.textContent = `分數：${score}`;
}

function draw() {
  ctx.fillStyle = '#071323';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#39c0ff';
  ctx.fillRect(apple.x * gridSize, apple.y * gridSize, gridSize, gridSize);

  snake.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? '#e7f9ff' : '#67d4ff';
    ctx.fillRect(part.x * gridSize + 1, part.y * gridSize + 1, gridSize - 2, gridSize - 2);
  });
}

function update() {
  if (!running || paused) return;

  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || snake.some(part => part.x === head.x && part.y === head.y)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === apple.x && head.y === apple.y) {
    score += 1;
    updateScore();
    placeApple();
  } else {
    snake.pop();
  }

  draw();
}

function gameLoop() {
  update();
  if (running && !paused) {
    gameLoopId = setTimeout(gameLoop, speed);
  }
}

function startGame() {
  if (!running) {
    running = true;
    paused = false;
    messageEl.textContent = '遊戲進行中';
    gameLoop();
  } else if (paused) {
    paused = false;
    messageEl.textContent = '遊戲恢復';
    gameLoop();
  }
  pauseBtn.textContent = '暫停';
}

function togglePause() {
  if (!running) {
    startGame();
    return;
  }

  paused = !paused;
  pauseBtn.textContent = paused ? '繼續' : '暫停';
  messageEl.textContent = paused ? '已暫停' : '繼續遊戲';
  if (!paused) {
    gameLoop();
  }
}

function endGame() {
  running = false;
  paused = false;
  messageEl.textContent = `遊戲結束，分數：${score}，請重新開始`;
  pauseBtn.textContent = '重新開始';
  clearTimeout(gameLoopId);
}

function setDirection(x, y) {
  if ((x === -direction.x && y === -direction.y) || (x === direction.x && y === direction.y)) {
    return;
  }
  nextDirection = { x, y };
  startGame();
}

window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      setDirection(0, -1);
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      setDirection(0, 1);
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      setDirection(-1, 0);
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      setDirection(1, 0);
      break;
    case ' ': 
      togglePause();
      break;
  }
});

controls.up.addEventListener('click', () => setDirection(0, -1));
controls.down.addEventListener('click', () => setDirection(0, 1));
controls.left.addEventListener('click', () => setDirection(-1, 0));
controls.right.addEventListener('click', () => setDirection(1, 0));
pauseBtn.addEventListener('click', togglePause);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      console.warn('Service Worker registration failed');
    });
  });
}

resetGame();
