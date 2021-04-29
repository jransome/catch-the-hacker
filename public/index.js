import { NIGHT_LENGTH, N_AVATARS, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';
import socket from './socket.js';
import images from './images.js';
import renderPlayer from './views/player.js';
import renderService from './views/service.js';
import renderVotingUi from './views/voting.js';

const { p5: P5 } = window;

const gameContainer = document.getElementById('game');

const gameState = {
  hackBtns: {},
  fireBtns: {},
  services: [],
  players: [],
  player: {},
  isNighttime: true,
  iVoted: false,
};
window.gameState = gameState; // for debugging
window.socket = socket; // for debugging

socket.on('sunrise', (services) => {
  gameState.services = services;
  gameState.isNighttime = false;
  gameState.iVoted = false;
});

socket.on('reshuffle', (services) => {
  gameState.services = services;
});

socket.on('nightfall', (services) => {
  gameState.services = services;
  gameState.isNighttime = true;
  gameState.sunriseTime = Date.now() + NIGHT_LENGTH;
});

socket.on('playersUpdated', (players) => {
  gameState.players = players;
  gameState.player.isFired = players.find(p => p.avatarId === gameState.player.avatarId).isFired;
});

const start = () => new P5((sketch) => {
  const nameInput = sketch
    .createInput()
    .attribute('placeholder', 'Enter your name')
    .id('nameInput');
  const nameSubmitBtn = sketch.createButton('submit').id('nameSubmitBtn');
  const everybodyInBtn = sketch.createButton("Everybody's in!").id('everybodysInBtn').hide();

  const DAY_COLOUR = sketch.color(255, 204, 0);
  const NIGHT_COLOUR = sketch.color(100, 10, 250);

  const onNameSubmitPressed = () => {
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

    socket.on('gameStarted', (playerData, role) => {
      waitingText.hide();
      everybodyInBtn.hide();
      gameState.player = { ...playerData, role };
    });
  };

  // eslint-disable-next-line no-param-reassign
  sketch.preload = () => {
    for (let i = 0; i < N_AVATARS; i++) {
      images.avatarImages.push(sketch.loadImage(`assets/${i}.png`));
    }
    images.fired = sketch.loadImage('assets/fired.png');
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
      sketch.createP(`${name}: ${role}`).position(CANVAS_WIDTH - 200, 45).id('playerNameInfo');
      // sketch.text(`${name}: ${role}`, CANVAS_WIDTH - 200, 45);
      renderPlayer(sketch, { role, avatarId }, CANVAS_WIDTH - 60, 45);
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
    gameState.services = gameState.services.map((s, i) => renderService(gameState, sketch, s, i));

    // draw voting ui
    renderVotingUi(gameState, sketch);
  };

  // AUTO TEST - TO BE DELETED
  // setTimeout(() => {
  //   const name = ['boris', 'trump', 'lala', 'blahla', 'a', 'b', 'c', 'haha', 'dog'][
  //     Math.floor(Math.random() * 9)
  //   ];
  //   nameInput.value(name + Date.now().toString().slice(-4));
  //   onNameSubmitPressed();
  // }, 500);
}, gameContainer);

start();
