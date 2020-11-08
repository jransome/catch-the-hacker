import socket from './socket.js';

const { p5: P5 } = window;

const CANVAS_HEIGHT = 600;
const CANVAS_WIDTH = 1000;
const N_AVATARS = 12;
const gameContainer = document.getElementById('game');

const start = () => new P5((sketch) => {
  // login elements
  const nameInput = sketch
    .createInput()
    .attribute('placeholder', 'Enter you name');
  const nameSubmitBtn = sketch.createButton('submit');
  const everybodyInBtn = sketch.createButton("Everybody's in!").hide();

  const avatarImages = [];
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
  };
      socket.on("newDay",() => {
       
        const serviceColour = sketch.color(200, 204, 0);
        sketch.fill(serviceColour);
        sketch.noStroke();
        sketch.rect(100, 200, 200, 100);
        const textColour = sketch.color(255,255,255);
        sketch.fill(textColour);
        sketch.text("ofc I hardcoded. it's VAS btw",200,180);
       
      })
  // eslint-disable-next-line no-param-reassign
  sketch.draw = () => {
    nameInput.center();
    everybodyInBtn.center();
    nameSubmitBtn.position(nameInput.x + nameInput.width + 10, nameInput.y);
  };
}, gameContainer);

start();

// export default {
//   start,
// };
