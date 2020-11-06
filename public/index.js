import socket from './socket.js';

const { p5: P5 } = window;

const CANVAS_HEIGHT = 600;
const CANVAS_WIDTH = 1000;
const gameContainer = document.getElementById('game');

const start = () => new P5((sketch) => {
  // login elements
  const nameInput = sketch.createInput().attribute('placeholder', 'Enter you name');
  const nameSubmitBtn = sketch.createButton('submit');



  


  // eslint-disable-next-line no-param-reassign
  sketch.setup = () => {
    sketch.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    sketch.textAlign(sketch.CENTER);
    sketch.background(60);
    
    nameSubmitBtn.mousePressed(() => {
      console.log('submit pressed', nameInput.value());
      if (!nameInput.value()) return;
      socket.emit('login', nameInput.value(), (assignedRole) => {
        nameInput.hide();
        nameSubmitBtn.hide();
        
        sketch.textSize(24);
        const roleIndicator = sketch.text(`${nameInput.value()}: ${assignedRole}`, CANVAS_WIDTH - 150, 30);
      });
      // roleIndicator.show();
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
