import socket from './socket.js';

const { p5: P5 } = window;

const CANVAS_HEIGHT = 600;
const CANVAS_WIDTH = 1000;
const N_AVATARS = 12;

// Services layout
const MAX_ROW_LENGTH = 3;
const COLUMN_SPACING = 330;
const ROW_SPACING = 250;
const TOP_MARGIN = 200;
const LEFT_MARGIN = 180;
const SERVICE_SIZE = [150, 100];

const gameContainer = document.getElementById('game');

const gameState = {
  services: [],
  // player: {},
};
window.gameState = gameState; // for debugging

socket.on('newDay', (services) => {
  gameState.services = services;
});

const renderService = (sketch, service, index) => {
  const colNumber = index % MAX_ROW_LENGTH;
  const rowNumber = Math.floor(index / MAX_ROW_LENGTH);

  const position = [
    LEFT_MARGIN + colNumber * COLUMN_SPACING,
    TOP_MARGIN + rowNumber * ROW_SPACING,
  ];

  sketch.noStroke();

  const serviceColour = sketch.color(0, 204, 0);
  sketch.fill(serviceColour);
  sketch.rectMode(sketch.CENTER);
  sketch.rect(...position, ...SERVICE_SIZE);

  const textColour = sketch.color(255, 255, 255);
  sketch.fill(textColour);
  sketch.textSize(24);
  sketch.text(service.name, ...position);

  const checkClicked = (mouseX, mouseY) => {
    const wasClicked = (
      mouseX > position[0] - SERVICE_SIZE[0] / 2
      && mouseX < position[0] + SERVICE_SIZE[0] / 2
      && mouseY > position[1] - SERVICE_SIZE[1] / 2
      && mouseY < position[1] + SERVICE_SIZE[1] / 2
    );

    if (!wasClicked) return;

    console.log(service.name, 'was clicked!');
  };

  return {
    ...service,
    checkClicked,
  };
};

const start = () => new P5((sketch) => {
  const nameInput = sketch.createInput().attribute('placeholder', 'Enter your name');
  const nameSubmitBtn = sketch.createButton('submit');
  const everybodyInBtn = sketch.createButton("Everybody's in!").hide();
  const avatarImages = [];

  const onNameSubmitPressed = () => {
    console.log('submit pressed', nameInput.value());
    if (!nameInput.value()) return;
    socket.emit('login', nameInput.value());
    nameInput.hide();
    nameSubmitBtn.hide();
    const waitingText = sketch.createP('Waiting for other players...').center();

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
      sketch.fill(100);
      sketch.text(`${nameInput.value()}: ${role}`, CANVAS_WIDTH - 200, 50);
      sketch.image(avatarImages[avatarId], CANVAS_WIDTH - 80, 10);
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
    sketch.textAlign(sketch.CENTER, sketch.CENTER);
    sketch.background(60);
    const topBarColour = sketch.color(255, 204, 0);
    sketch.fill(topBarColour);
    sketch.noStroke();
    sketch.rect(0, 0, CANVAS_WIDTH, 70);

    nameSubmitBtn.mousePressed(onNameSubmitPressed);
  };

  // eslint-disable-next-line no-param-reassign
  sketch.draw = () => {
    nameInput.center();
    everybodyInBtn.center();
    nameSubmitBtn.position(nameInput.x + nameInput.width + 10, nameInput.y);

    gameState.services = gameState.services.map((s, i) => renderService(sketch, s, i));
  };

  // eslint-disable-next-line no-param-reassign
  sketch.mouseReleased = () => {
    gameState.services.forEach(s => s.checkClicked(sketch.mouseX, sketch.mouseY));
  };

  // AUTO TEST - TO BE DELETED
  setTimeout(() => {
    nameInput.value(Date.now());
    onNameSubmitPressed();
  }, 500);
}, gameContainer);

start();

// export default {
//   start,
// };
