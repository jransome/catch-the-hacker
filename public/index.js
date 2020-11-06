import socket from './socket.js';

const { p5: P5 } = window;

const CANVAS_HEIGHT = 600;
const CANVAS_WIDTH = 1000;
const gameContainer = document.getElementById('game');


const start = () => new P5((sketch) => {
  const nameInput = sketch.createInput().attribute('placeholder', 'Enter you name');
  const nameSubmitBtn = sketch.createButton('submit');

  // eslint-disable-next-line no-param-reassign
  sketch.setup = () => {
    sketch.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    sketch.textAlign(sketch.CENTER);
    sketch.background(60);

    nameSubmitBtn.mousePressed(() => {
      console.log('submit pressed', nameInput.value());
      socket.emit('login', nameInput.value());
    });
  };

  // eslint-disable-next-line no-param-reassign
  sketch.draw = () => {
    nameInput.center();
    nameSubmitBtn.position(nameInput.x + nameInput.width + 10, nameInput.y);

  };
}, gameContainer);

start();

// export default {
//   start,
// };
