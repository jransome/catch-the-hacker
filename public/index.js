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

const start = () => new P5((sketch) => {
  const nameInput = sketch.createInput().attribute('placeholder', 'Enter your name');
  const nameSubmitBtn = sketch.createButton('submit');
  const everybodyInBtn = sketch.createButton("Everybody's in!").hide();
  const avatarImages = [];

  const drawService = (name, index) => {
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
    sketch.textAlign(sketch.CENTER, sketch.CENTER);
    sketch.text(name, ...position);
  }

  socket.on('newDay', (services) => {

  });

  // eslint-disable-next-line no-param-reassign
  sketch.preload = () => {
    for (let i = 0; i < N_AVATARS; i++) {
      avatarImages.push(sketch.loadImage(`assets/${i}.png`));
    }
  };

  // eslint-disable-next-line no-param-reassign
  sketch.setup = () => {
    sketch.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    sketch.textAlign(sketch.CENTER);
    sketch.background(60);
    sketch.textSize(24);
    const topBarColour = sketch.color(255, 204, 0);
    sketch.fill(topBarColour);
    sketch.noStroke();
    sketch.rect(0, 0, CANVAS_WIDTH, 70);

    nameSubmitBtn.mousePressed(() => {
      console.log('submit pressed', nameInput.value());
      if (!nameInput.value()) return;
      socket.emit('login', nameInput.value());
      nameInput.hide();
      nameSubmitBtn.hide();

      socket.on('canStart', () => {
        everybodyInBtn.show();
        everybodyInBtn.mousePressed(() => {
          socket.emit('gameStart');
          everybodyInBtn.hide();
        });
      });

      socket.on('gameStarted', (role, avatarId) => {
        everybodyInBtn.hide();
        sketch.fill(100);
        sketch.text(`${nameInput.value()}: ${role}`, CANVAS_WIDTH - 200, 50);
        sketch.image(avatarImages[avatarId], CANVAS_WIDTH - 80, 10);
      });
    });

    drawService('vas', 0);
    drawService('dpg', 1);
    drawService('event-sink', 2);
    drawService('bills-checker', 3);
    drawService('your-face', 4);

  };

  // eslint-disable-next-line no-param-reassign
  sketch.draw = () => {
    nameInput.center();
    everybodyInBtn.center();
    nameSubmitBtn.position(nameInput.x + nameInput.width + 10, nameInput.y);

    // drawService('vas', 0);
    // drawService('dpg', 1);
    // drawService('event-sink', 3);

  };
}, gameContainer);

start();

// export default {
//   start,
// };
