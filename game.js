const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const bgImg = new Image();
bgImg.src = "1764300231969.png";
let bgReady = false;
bgImg.onload = () => { bgReady = true; };
const scoreEl = document.getElementById("score");

const startModal = document.getElementById("startModal");
const gameOverModal = document.getElementById("gameOverModal");
const finalScoreEl = document.getElementById("finalScore");

const startBtn = document.getElementById("startBtn");
const retryBtn = document.getElementById("retryBtn");
const restartBtn = document.getElementById("restart");
const bgm = new Audio("Cinematic Pulse.mp3");
bgm.loop = true;
bgm.preload = "auto";
bgm.volume = 0.5;

const size = 20;
let cellSize;
let snake, dir, nextDir, food;
let score = 0;
let running = false;
let speed = 22;
let loopId;
let foodMoveTimer = 0;

const snakeColor = "#4df0c8";
const foodColor = "#ff5f5f";

function syncBgm() {
  if (running) {
    bgm.play();
  } else {
    bgm.pause();
  }
}

function placeFood() {
  while (true) {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    if (!snake.some(s => s.x === x && s.y === y)) {
      food = { x, y };
      foodMoveTimer = 0;
      break;
    }
  }
}

function reset() {
  cellSize = Math.floor(canvas.width / size);
  snake = [{ x: 10, y: 10 }];
  dir = { x: 1, y: 0 };
  nextDir = dir;
  score = 0;
  speed = 22;
  placeFood();
  scoreEl.textContent = score;
  running = true;
  cancelAnimationFrame(loopId);
  requestAnimationFrame(gameLoop);
}

function drawCell(x, y, color) {
  ctx.fillStyle = color;
  ctx.shadowBlur = 18;
  ctx.shadowColor = color;
  ctx.fillRect(x * cellSize + 2, y * cellSize + 2, cellSize - 4, cellSize - 4);
  ctx.shadowBlur = 0;
}

function draw() {
  if (bgReady) {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#0d1220";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  for (let i = 0; i <= size; i++) {
    const p = i * cellSize;
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(canvas.width, p); ctx.stroke();
  }

  drawCell(food.x, food.y, foodColor);
  snake.forEach(s => drawCell(s.x, s.y, snakeColor));
}

function step() {
  if (nextDir.x !== -dir.x || nextDir.y !== -dir.y) dir = nextDir;

  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  if (
    head.x < 0 || head.x >= size ||
    head.y < 0 || head.y >= size ||
    snake.some(s => s.x === head.x && s.y === head.y)
  ) {
    gameOver();
    return;
  }

  snake.unshift(head);

  // Move food every 6 frames
  foodMoveTimer++;
  if (foodMoveTimer % 6 === 0) {
    const dirs = [
      { x: 1, y: 0 }, { x: -1, y: 0 },
      { x: 0, y: 1 }, { x: 0, y: -1 }
    ];
    const d = dirs[Math.floor(Math.random() * dirs.length)];
    const nx = food.x + d.x;
    const ny = food.y + d.y;

    if (
      nx >= 0 && nx < size &&
      ny >= 0 && ny < size &&
      !snake.some(s => s.x === nx && s.y === ny)
    ) {
      food.x = nx;
      food.y = ny;
    }
  }

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    placeFood();
  } else {
    snake.pop();
  }
}

function gameOver() {
  running = false;
  finalScoreEl.textContent = score;
  gameOverModal.classList.add("active");
  syncBgm();
}

let last = performance.now();
function gameLoop(now) {
  loopId = requestAnimationFrame(gameLoop);
  if (!running) return;
  if (now - last > 1000 / speed) {
    last = now;
    step();
    draw();
  }
}

const keyMap = {
  ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 }, s: { x: 0, y: 1 },
  a: { x: -1, y: 0 }, d: { x: 1, y: 0 }
};

window.addEventListener("keydown", e => {
  const k = e.key;
  if (k == " ") { running = !running; syncBgm(); }
  if (k === "r" || k === "R") { reset(); return; }
  if (keyMap[k]) {
    const d = keyMap[k];
    if (!(d.x === -dir.x && d.y === -dir.y)) nextDir = d;
  }
});

document.querySelector(".touch-pad").addEventListener("click", e => {
  const t = e.target.closest("[data-dir]");
  if (!t) return;
  const map = {
    up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
    left: { x: -1, y: 0 }, right: { x: 1, y: 0 }
  };
  const d = map[t.dataset.dir];
  if (!(d.x === -dir.x && d.y === -dir.y)) nextDir = d;
});

function fitCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.width;
  cellSize = Math.floor(canvas.width / size);
  draw();
}

window.addEventListener("resize", fitCanvas);

startBtn.onclick = () => {
  startModal.classList.remove("active");
  reset();
  draw();
  bgm.currentTime = 0;
  syncBgm();
};

retryBtn.onclick = () => {
  gameOverModal.classList.remove("active");
  reset();
  draw();
  bgm.currentTime = 0;
  syncBgm();
};

restartBtn.onclick = () => {
  reset();
  draw();
  bgm.currentTime = 0;
  syncBgm();
};

fitCanvas();
