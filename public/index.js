import socket from './socket.js';

const { p5: P5 } = window;

const NIGHT_LENGTH = 10000;

const CANVAS_HEIGHT = 800;
const CANVAS_WIDTH = 1400;
const N_AVATARS = 12;

// Services layout
const MAX_ROW_LENGTH = 4;
const COLUMN_SPACING = 330;
const ROW_SPACING = 250;
const TOP_MARGIN = 150;
const LEFT_MARGIN = 180;
const SERVICE_SIZE = [250, 50];

const gameContainer = document.getElementById('game');
const avatarImages = [];

const gameState = {
  hackBtns: {},
  fireBtns: {},
  services: [],
  players: [],
  player: {},
  isNighttime: true,
};
window.gameState = gameState; // for debugging
window.socket = socket; // for debugging

socket.on('sunrise', (services) => {
  gameState.services = services;
  gameState.isNighttime = false;
});

socket.on('reshuffle', (services) => {
  gameState.services = services;
  gameState.isNighttime = false;
});

socket.on('nightfall', (services) => {
  gameState.services = services;
  gameState.isNighttime = true;
  gameState.sunriseTime = Date.now() + NIGHT_LENGTH;
});

socket.on('playersUpdated', (players) => {
  gameState.players = players;
});

const renderPlayer = (sketch, { name, avatarId }, xPos, yPos) => {
  sketch.image(avatarImages[avatarId], xPos, yPos);
  sketch.textSize(18);
  sketch.fill(255);
  sketch.textStyle(sketch.BOLD);
  sketch.text(name, xPos, yPos + 50);
};

const renderService = (sketch, service, index) => {
  const colNumber = index % MAX_ROW_LENGTH;
  const rowNumber = Math.floor(index / MAX_ROW_LENGTH);

  const position = [
    LEFT_MARGIN + colNumber * COLUMN_SPACING,
    TOP_MARGIN + rowNumber * ROW_SPACING,
  ];

  sketch.noStroke();

  const serviceColour = sketch.color(0, 204, 0);
  if (service.hackedLastNight) {
    if (new Date().getSeconds() % 2) {
      sketch.stroke('red');
      sketch.strokeWeight(4);
    }
  }

  sketch.fill(serviceColour);
  sketch.rect(...position, ...SERVICE_SIZE);

  const textColour = sketch.color(255, 255, 255);
  sketch.fill(textColour);
  sketch.textSize(24);
  sketch.text(service.name, ...position);

  service.workers.forEach((w, i) => {
    renderPlayer(sketch, w, position[0] + (i - 1) * 80, position[1] + 70);
  });

  const hackBtn = gameState.hackBtns[service.name];
  if (
    gameState.isNighttime
    && !hackBtn
    && gameState.player.role === 'HACKER'
    && service.workers.find(w => w.name === gameState.player.name)
  ) {
    gameState.hackBtns[service.name] = sketch.createButton('hack');
    gameState.hackBtns[service.name].mousePressed(() => {
      gameState.hackBtns[service.name].hide();
      socket.emit('hacked', service.name);
    });
  } else if (!gameState.isNighttime && hackBtn) {
    hackBtn.hide();
  }

  if (hackBtn) {
    hackBtn.position(
      sketch.canvas.offsetLeft + position[0],
      sketch.canvas.offsetTop + position[1],
    );
  }

  return service;
};

const start = () => new P5((sketch) => {
  const nameInput = sketch
    .createInput()
    .attribute('placeholder', 'Enter your name');
  const nameSubmitBtn = sketch.createButton('submit');
  const everybodyInBtn = sketch.createButton("Everybody's in!").hide();

  const DAY_COLOUR = sketch.color(255, 204, 0);
  const NIGHT_COLOUR = sketch.color(100, 10, 250);

  const onNameSubmitPressed = () => {
    console.log('submit pressed', nameInput.value());
    if (!nameInput.value()) return;
    socket.emit('login', nameInput.value());
    nameInput.hide();
    nameSubmitBtn.hide();
    const waitingText = sketch
      .createP('Waiting for other players...')
      .center();

    socket.on('canStart', () => {
      waitingText.hide();
      everybodyInBtn.show();
      everybodyInBtn.mousePressed(() => {
        socket.emit('gameStart');
        everybodyInBtn.hide();
      });
    });

    socket.on('gameStarted', (role, avatarId) => {
      waitingText.hide();
      everybodyInBtn.hide();
      gameState.player = { name: nameInput.value(), role, avatarId };
    });
  };

  // eslint-disable-next-line no-param-reassign
  sketch.preload = () => {
    for (let i = 0; i < N_AVATARS; i++) {
      avatarImages.push(sketch.loadImage(`assets/${i}.png`));
    }
  };

  // eslint-disable-next-line no-param-reassign
  sketch.setup = () => {
    sketch.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    sketch.rectMode(sketch.CENTER);
    sketch.imageMode(sketch.CENTER);
    sketch.textAlign(sketch.CENTER, sketch.CENTER);
    nameSubmitBtn.mousePressed(onNameSubmitPressed);
  };

  // eslint-disable-next-line no-param-reassign
  sketch.draw = () => {
    sketch.background(60);

    // top bar
    const topBarColour = gameState.isNighttime ? NIGHT_COLOUR : DAY_COLOUR;
    sketch.fill(topBarColour);
    sketch.noStroke();
    sketch.rect(CANVAS_WIDTH / 2, 35, CANVAS_WIDTH, 100);

    // player info
    const { name, role, avatarId } = gameState.player;
    if (name) {
      sketch.fill(gameState.isNighttime ? 255 : 30);
      sketch.textSize(20);
      sketch.text(`${name}: ${role}`, CANVAS_WIDTH - 200, 45);
      sketch.image(avatarImages[avatarId], CANVAS_WIDTH - 60, 45);
    }

    // keep stuff centred
    nameInput.center();
    everybodyInBtn.center();
    nameSubmitBtn.position(nameInput.x + nameInput.width + 10, nameInput.y);

    // night clock
    if (gameState.isNighttime) {
      const secondsTillSunrise = (gameState.sunriseTime - Date.now()) / 1000;
      sketch.text(`Night ending in: ${Math.round(secondsTillSunrise)}`, 150, 45);
      if (secondsTillSunrise < 0) gameState.isNighttime = false;
    }

    // draw services
    gameState.services = gameState.services.map((s, i) => renderService(sketch, s, i));

    // draw voting ballot
    sketch.fill('grey');
    sketch.noStroke();
    sketch.rect(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50, CANVAS_WIDTH, 150);
    gameState.players.forEach((p, i) => {
      const xPos = 60 + i * 120;
      const yPos = CANVAS_HEIGHT - 70;
      renderPlayer(sketch, p, xPos, yPos);

      p.accusers.forEach((accuser, j) => {
        renderPlayer(sketch, accuser, xPos, yPos - (110 + j * 110));
      });

      const fireBtn = gameState.fireBtns[p.avatarId];
      if (!fireBtn && p.name !== gameState.player.name) {
        const btn = sketch.createButton('FIRE');
        gameState.fireBtns[p.avatarId] = btn;
        btn.mousePressed(() => {
          Object.values(gameState.fireBtns).forEach(b => b.hide());
          socket.emit('voteCast', { voter: gameState.player, accused: p });
        });
      } else if (fireBtn) {
        fireBtn.position(
          sketch.canvas.offsetLeft + xPos,
          sketch.canvas.offsetTop + CANVAS_HEIGHT - 100,
        );
      }
    });
  };

  // AUTO TEST - TO BE DELETED
  setTimeout(() => {
    const name = ['boris', 'trump', 'lala', 'blahla', 'a', 'b', 'c', 'haha', 'dog'][
      Math.floor(Math.random() * 9)
    ];
    nameInput.value(name + Date.now().toString().slice(-4));
    onNameSubmitPressed();
  }, 500);
}, gameContainer);

start();

// export default {
//   start,
// };
