import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../constants.js';
import socket from '../socket.js';
import renderPlayer from './player.js';

const createFireBtnForPlayer = (gameState, sketch, p) => {
  const btn = sketch.createButton('FIRE');
  btn.mousePressed(() => {
    // eslint-disable-next-line no-param-reassign
    gameState.iVoted = true;
    Object.values(gameState.fireBtns).forEach(b => b.hide());
    socket.emit('voteCast', { accuser: gameState.player, accused: p });
  });
  return btn;
};

export default (gameState, sketch) => {
  sketch.fill('grey');
  sketch.noStroke();
  sketch.rect(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50, CANVAS_WIDTH, 150);

  gameState.players.forEach((p, i) => {
    const xPos = 60 + i * 120;
    const yPos = CANVAS_HEIGHT - 70;

    // render player avatars
    renderPlayer(sketch, p, xPos, yPos);

    // render accusers on top of player avatars
    p.accusers.forEach((accuser, j) => {
      renderPlayer(sketch, accuser, xPos, yPos - (110 + j * 110));
    });

    // Don't render the fire buttons if it's for yourself, the player or target player is already fired, it's nighttime, or the player has already voted
    if (p.name === gameState.player.name || gameState.player.isFired || p.isFired || gameState.isNighttime || gameState.iVoted) return;

    // eslint-disable-next-line no-param-reassign
    gameState.fireBtns[p.avatarId] ??= createFireBtnForPlayer(gameState, sketch, p); // create buttons if they don't exist
    const fireBtn = gameState.fireBtns[p.avatarId];

    fireBtn.show();
    fireBtn.position(
      sketch.canvas.offsetLeft + xPos - 10,
      sketch.canvas.offsetTop + CANVAS_HEIGHT - 100,
    );
  });
};
