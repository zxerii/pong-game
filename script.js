const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playerScoreEl = document.getElementById('playerScore');
const computerScoreEl = document.getElementById('computerScore');

const game = {
  width: canvas.width,
  height: canvas.height,
  keys: { ArrowUp: false, ArrowDown: false },
  mouseY: canvas.height / 2,
  lastTime: 0,
};

const paddleWidth = 16;
const paddleHeight = 110;
const paddleSpeed = 7.5;
const ballRadius = 9;
const maxBallSpeed = 10;

const leftPaddle = {
  x: 30,
  y: game.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  speed: paddleSpeed,
  score: 0,
};

const rightPaddle = {
  x: game.width - 30 - paddleWidth,
  y: game.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  speed: 5.2,
  score: 0,
};

const ball = {
  x: game.width / 2,
  y: game.height / 2,
  radius: ballRadius,
  vx: 5,
  vy: 4,
};

function resetBall(direction = 1) {
  ball.x = game.width / 2;
  ball.y = game.height / 2;

  const angle = (Math.random() * 1.2 - 0.6); // -0.6 to 0.6 radians
  const speed = 5 + Math.random() * 1.2;

  ball.vx = direction * speed * Math.cos(angle);
  ball.vy = speed * Math.sin(angle);

  if (Math.abs(ball.vx) < 3) {
    ball.vx = direction * 4;
  }
}

function updateScoreboard() {
  playerScoreEl.textContent = leftPaddle.score;
  computerScoreEl.textContent = rightPaddle.score;
}

function drawCenterLine() {
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 3;
  ctx.setLineDash([16, 16]);
  ctx.beginPath();
  ctx.moveTo(game.width / 2, 0);
  ctx.lineTo(game.width / 2, game.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPaddle(paddle, color) {
  ctx.fillStyle = color;
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.beginPath();
  ctx.fillStyle = '#f8fafc';
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
}

function updateLeftPaddle() {
  if (game.keys.ArrowUp) {
    leftPaddle.y -= leftPaddle.speed;
  }
  if (game.keys.ArrowDown) {
    leftPaddle.y += leftPaddle.speed;
  }

  if (leftPaddle.y < 0) leftPaddle.y = 0;
  if (leftPaddle.y + leftPaddle.height > game.height) {
    leftPaddle.y = game.height - leftPaddle.height;
  }
}

function updateRightPaddle() {
  const paddleCenter = rightPaddle.y + rightPaddle.height / 2;
  const targetY = ball.y - rightPaddle.height / 2;

  if (paddleCenter < targetY) {
    rightPaddle.y += rightPaddle.speed;
  } else if (paddleCenter > targetY) {
    rightPaddle.y -= rightPaddle.speed;
  }

  if (rightPaddle.y < 0) rightPaddle.y = 0;
  if (rightPaddle.y + rightPaddle.height > game.height) {
    rightPaddle.y = game.height - rightPaddle.height;
  }
}

function handlePaddleCollision() {
  const paddleCollision = (paddle) => {
    const ballLeft = ball.x - ball.radius;
    const ballRight = ball.x + ball.radius;
    const ballTop = ball.y - ball.radius;
    const ballBottom = ball.y + ball.radius;

    const paddleLeft = paddle.x;
    const paddleRight = paddle.x + paddle.width;
    const paddleTop = paddle.y;
    const paddleBottom = paddle.y + paddle.height;

    const overlaps =
      ballRight > paddleLeft &&
      ballLeft < paddleRight &&
      ballBottom > paddleTop &&
      ballTop < paddleBottom;

    if (!overlaps) return false;

    const collisionPoint = ball.y - (paddle.y + paddle.height / 2);
    const normalized = collisionPoint / (paddle.height / 2);
    const bounceAngle = normalized * (Math.PI / 3);
    const speed = Math.min(Math.hypot(ball.vx, ball.vy) + 0.35, maxBallSpeed);

    if (paddle === leftPaddle) {
      ball.x = paddle.x + paddle.width + ball.radius;
      ball.vx = Math.abs(Math.cos(bounceAngle)) * speed;
    } else {
      ball.x = paddle.x - ball.radius;
      ball.vx = -Math.abs(Math.cos(bounceAngle)) * speed;
    }

    ball.vy = Math.sin(bounceAngle) * speed;
    return true;
  };

  if (paddleCollision(leftPaddle) || paddleCollision(rightPaddle)) {
    return;
  }
}

function updateBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= game.height) {
    ball.vy *= -1;
    ball.y = Math.max(ball.radius, Math.min(game.height - ball.radius, ball.y));
  }

  if (ball.x - ball.radius <= 0) {
    rightPaddle.score += 1;
    updateScoreboard();
    resetBall(1);
  }

  if (ball.x + ball.radius >= game.width) {
    leftPaddle.score += 1;
    updateScoreboard();
    resetBall(-1);
  }

  handlePaddleCollision();
}

function draw() {
  ctx.clearRect(0, 0, game.width, game.height);
  drawCenterLine();
  drawPaddle(leftPaddle, '#5eead4');
  drawPaddle(rightPaddle, '#fda4af');
  drawBall();
}

function gameLoop(timestamp) {
  const delta = timestamp - game.lastTime;
  game.lastTime = timestamp;

  updateLeftPaddle();
  updateRightPaddle();
  updateBall();
  draw();

  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    game.keys[event.key] = true;
    event.preventDefault();
  }
});

window.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    game.keys[event.key] = false;
  }
});

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const pointerY = ((event.clientY - rect.top) / rect.height) * game.height;
  leftPaddle.y = pointerY - leftPaddle.height / 2;

  if (leftPaddle.y < 0) leftPaddle.y = 0;
  if (leftPaddle.y + leftPaddle.height > game.height) {
    leftPaddle.y = game.height - leftPaddle.height;
  }
});

updateScoreboard();
resetBall(1);
requestAnimationFrame(gameLoop);
