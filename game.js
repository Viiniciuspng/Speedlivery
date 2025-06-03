const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Função para redimensionar o canvas para a tela inteira
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// Redimensiona o canvas quando a janela for redimensionada
window.addEventListener('resize', resizeCanvas);

// Chama a função para redimensionar o canvas no início
resizeCanvas();

// Imagens
const roadImg = new Image();
roadImg.src = 'imagens/road.png';

const motoImg = new Image();
motoImg.src = 'imagens/moto.png';

const dogImg = new Image();
dogImg.src = 'imagens/dog.png';

const buracoImg = new Image();
buracoImg.src = 'imagens/buraco.png'; // Certifique-se que este arquivo é diferente de 'dog.png'

// Variáveis de estado
let roadY = 0;
let roadSpeed = 4;
let score = 0;
let frameCount = 0;
let isPaused = false;
let gameStarted = false;

const pistaLimiteEsquerda = 50;
const pistaLimiteDireita = canvas.width - 90;

// Jogador
const player = {
  x: canvas.width / 2 - 20, // Centraliza o jogador na tela
  y: canvas.height - 120, // Posiciona o jogador na parte inferior
  width: 40,
  height: 60,
  speed: 12
};

// Cachorros
let dogs = [];
let dogSpawnInterval = 160;

function spawnDog() {
  const direction = Math.floor(Math.random() * 3); // 0 = esquerda, 1 = centro, 2 = direita
  let x;
  if (direction === 0) x = 0;
  else if (direction === 1) x = player.x;
  else x = canvas.width - 40;

  const dog = {
    x,
    y: -60,
    width: 40,
    height: 60,
    speed: roadSpeed - 0.5
  };
  dogs.push(dog);
}

function updateDogs() {
  for (let dog of dogs) {
    dog.y += dog.speed;
    if (dog.x < player.x) dog.x += 1;
    else if (dog.x > player.x) dog.x -= 1;
  }
  dogs = dogs.filter(d => d.y < canvas.height + d.height);
}

function drawDogs() {
  for (let dog of dogs) {
    ctx.drawImage(dogImg, dog.x, dog.y, dog.width, dog.height);
  }
}

// Buracos
let buracos = [];
let buracoSpawnInterval = 220;
const buracoStartDelay = 600;

function spawnBuraco() {
  const groupSize = Math.floor(Math.random() * 2) + 2; // 2 ou 3 buracos
  const spacing = 45; // Espaço entre buracos
  let startX = pistaLimiteEsquerda + Math.random() * (pistaLimiteDireita - pistaLimiteEsquerda - spacing * (groupSize - 1));

  for (let i = 0; i < groupSize; i++) {
    const buraco = {
      x: startX + i * spacing,
      y: -60,
      width: 50, // Buraco maior
      height: 50,
      speed: roadSpeed
    };
    buracos.push(buraco);
  }
}

function updateBuracos() {
  for (let buraco of buracos) {
    buraco.y += buraco.speed;
  }
  buracos = buracos.filter(b => b.y < canvas.height + b.height);
}

function drawBuracos() {
  for (let buraco of buracos) {
    ctx.drawImage(buracoImg, buraco.x, buraco.y, buraco.width, buraco.height);
  }
}

function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

// Controles
document.addEventListener('keydown', (e) => {
  if (e.key === 'p' || e.key === 'P') {
    togglePause();
  }
  if (!isPaused && gameStarted) {
    if (e.key === 'ArrowLeft' && player.x > pistaLimiteEsquerda) player.x -= player.speed;
    if (e.key === 'ArrowRight' && player.x < pistaLimiteDireita) player.x += player.speed;
  }
});

let touchStartX = 0;
canvas.addEventListener('touchstart', (e) => {
  if (!isPaused && gameStarted) {
    touchStartX = e.touches[0].clientX;
  }
});
canvas.addEventListener('touchmove', (e) => {
  if (!isPaused && touchStartX !== 0 && gameStarted) {
    const touchMoveX = e.touches[0].clientX;
    const deltaX = touchMoveX - touchStartX;
    // Aumenta a velocidade da movimentação
    player.x += deltaX / 5; // Aumenta o divisor para tornar a movimentação mais rápida
    if (player.x < pistaLimiteEsquerda) player.x = pistaLimiteEsquerda;
    if (player.x > pistaLimiteDireita) player.x = pistaLimiteDireita;
    touchStartX = touchMoveX;
  }
});

// Desenha elementos
function drawRoad() {
  ctx.drawImage(roadImg, 0, roadY, canvas.width, canvas.height);
  ctx.drawImage(roadImg, 0, roadY - canvas.height, canvas.width, canvas.height);
  if (!isPaused && gameStarted) {
    roadY += roadSpeed;
    if (roadY >= canvas.height) roadY = 0;
  }
}

function drawPlayer() {
  ctx.drawImage(motoImg, player.x, player.y, player.width, player.height);
}

// Game Loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawRoad();
  drawPlayer();

  if (!isPaused && gameStarted) {
    frameCount++;

    if (frameCount % 30 === 0) {
      score++;
      if (score % 10 === 0) {
        roadSpeed += 0.5;
        player.speed += 0.2;
      }
    }

    if (frameCount >= 3 && frameCount <= 2700) {
      if (frameCount % dogSpawnInterval === 0) spawnDog();
      if (frameCount > buracoStartDelay && frameCount % buracoSpawnInterval === 0) spawnBuraco();

      updateDogs();
      updateBuracos();
      drawDogs();
      drawBuracos();

      for (let dog of dogs) {
        if (checkCollision(player, dog)) {
          showGameOver('O cachorro te mordeu 🐶');
          return;
        }
      }

      for (let buraco of buracos) {
        if (checkCollision(player, buraco)) {
          showGameOver('Alô prefeeito, fi do sarta moita 😂');
          return;
        }
      }
    }

    if (frameCount === 2701) {
      dogs.length = 0;
      buracos.length = 0;
    }
  }

  document.getElementById('scoreText').textContent = 'Pontos: ' + score;
  requestAnimationFrame(gameLoop);
}

function showGameOver(message) {
  isPaused = true;
  document.getElementById('pauseOverlay').style.display = 'none';
  const overlay = document.getElementById('gameOverOverlay');
  const msg = document.getElementById('endMessage');
  msg.textContent = message;
  overlay.style.display = 'flex';
}

function restartGame() {
  score = 0;
  frameCount = 0;
  roadSpeed = 4;
  player.speed = 12;
  player.x = canvas.width / 2 - 20; // Centraliza o jogador na tela
  player.y = canvas.height - 120;
  dogs = [];
  buracos = [];
  document.getElementById('gameOverOverlay').style.display = 'none';
  document.getElementById('pauseOverlay').style.display = 'none';
  document.getElementById('endMessage').textContent = '';
  gameStarted = true;
  isPaused = false;
  gameLoop();
}

function togglePause() {
  isPaused = !isPaused;
  if (isPaused) {
    document.getElementById('pauseOverlay').style.display = 'flex';
  } else {
    document.getElementById('pauseOverlay').style.display = 'none';
  }
}

restartGame();
