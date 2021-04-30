import { MAX_ROW_LENGTH, LEFT_MARGIN, TOP_MARGIN, SERVICE_SIZE, COLUMN_SPACING, ROW_SPACING } from '../constants.js';
import socket from '../socket.js';
import renderPlayer from './player.js';

export default (gameState, sketch, service, index) => {
  const colNumber = index % MAX_ROW_LENGTH;
  const rowNumber = Math.floor(index / MAX_ROW_LENGTH);

  const position = [
    LEFT_MARGIN + colNumber * COLUMN_SPACING,
    TOP_MARGIN + rowNumber * ROW_SPACING,
  ];

  sketch.noStroke();

  const serviceColours = [
    sketch.color(200, 0, 0), // red
    sketch.color(255, 140, 0), // orange
    sketch.color(0, 204, 0), // green
  ];

  if (service.hackedLastNight) {
    if (new Date().getSeconds() % 2) {
      sketch.stroke('red');
      sketch.strokeWeight(4);
    }
  }

  sketch.fill(serviceColours[service.lives - 1]);
  sketch.rect(...position, ...SERVICE_SIZE);

  const textColour = sketch.color(255, 255, 255);
  sketch.fill(textColour);
  sketch.textSize(24);
  sketch.text(service.name, ...position);

  service.workers.forEach((w, i) => {
    renderPlayer(sketch, w, position[0] + (i - 1) * 80, position[1] + 70);
  });

  const hackBtn = gameState.hackBtns[service.name];
  // TODO: hackbtn not showing up on day 2
  if (
    gameState.isNighttime
    && !hackBtn
    && gameState.player.role === 'HACKER'
    && service.workers.find(w => w.name === gameState.player.name)
  ) {
    // eslint-disable-next-line no-param-reassign
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
