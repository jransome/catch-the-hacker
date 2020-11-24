import socket from "./socket.js";

const { p5: P5 } = window;

const CANVAS_HEIGHT = 600;
const CANVAS_WIDTH = 1000;
const N_AVATARS = 12;

// Services layout
const MAX_ROW_LENGTH = 3;
const COLUMN_SPACING = 330;
const ROW_SPACING = 250;
const TOP_MARGIN = 150;
const LEFT_MARGIN = 180;
const SERVICE_SIZE = [250, 50];

const gameContainer = document.getElementById("game");
const avatarImages = [];

const gameState = {
  services: [],
  player: {},
};
window.gameState = gameState; // for debugging
window.socket = socket;

socket.on("newDay", (services) => {
  gameState.services = services;
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
  sketch.fill(serviceColour);
  sketch.rect(...position, ...SERVICE_SIZE);

  const textColour = sketch.color(255, 255, 255);
  sketch.fill(textColour);
  sketch.textSize(24);
  sketch.text(service.name, ...position);

  service.workers.forEach((w, i) => {
    renderPlayer(sketch, w, position[0] + (i - 1) * 80, position[1] + 70);
  });

  if (
    !service.hackBtn &&
    gameState.player.role === "HACKER" &&
    service.workers.find((w) => w.name === gameState.player.name)
  ) {
    service.hackBtn = sketch.createButton("hack");
    service.hackBtn.mousePressed(() => {
      service.hackBtn.hide();
      socket.emit("hacked", service.name);
    });
  }

  service.hackBtn &&
    service.hackBtn.position(
      sketch.canvas.offsetLeft + position[0],
      sketch.canvas.offsetTop + position[1]
    );

  return service;
};

const start = () =>
  new P5((sketch) => {
    const nameInput = sketch
      .createInput()
      .attribute("placeholder", "Enter your name");
    const nameSubmitBtn = sketch.createButton("submit");
    const everybodyInBtn = sketch.createButton("Everybody's in!").hide();

    const onNameSubmitPressed = () => {
      console.log("submit pressed", nameInput.value());
      if (!nameInput.value()) return;
      socket.emit("login", nameInput.value());
      nameInput.hide();
      nameSubmitBtn.hide();
      const waitingText = sketch
        .createP("Waiting for other players...")
        .center();

      socket.on("canStart", () => {
        waitingText.hide();
        everybodyInBtn.show();
        everybodyInBtn.mousePressed(() => {
          socket.emit("gameStart");
          everybodyInBtn.hide();
        });
      });

      socket.on("gameStarted", (role, avatarId) => {
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
      const topBarColour = sketch.color(255, 204, 0);
      sketch.fill(topBarColour);
      sketch.noStroke();
      sketch.rect(CANVAS_WIDTH / 2, 35, CANVAS_WIDTH, 100);

      // player info
      const { name, role, avatarId } = gameState.player;
      if (name) {
        sketch.fill(100);
        sketch.textSize(20);
        sketch.text(`${name}: ${role}`, CANVAS_WIDTH - 200, 45);
        sketch.image(avatarImages[avatarId], CANVAS_WIDTH - 60, 45);
      }

      // keep stuff centred
      nameInput.center();
      everybodyInBtn.center();
      nameSubmitBtn.position(nameInput.x + nameInput.width + 10, nameInput.y);

      // draw services
      gameState.services = gameState.services.map((s, i) =>
        renderService(sketch, s, i)
      );
    };

    // eslint-disable-next-line no-param-reassign
    // sketch.mouseReleased = () => {
    //   gameState.services.forEach((s) =>
    //     s.checkClicked(sketch.mouseX, sketch.mouseY)
    //   );
    // };

    // AUTO TEST - TO BE DELETED
    setTimeout(() => {
      const name = ["boris", "trump", "lala", "blahla","sdsd","sdsdfgggg"][
        Math.floor(Math.random() * 5)
      ];
      nameInput.value(name);
      onNameSubmitPressed();
    }, 500);
  }, gameContainer);

start();

// export default {
//   start,
// };
