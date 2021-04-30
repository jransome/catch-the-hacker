import images from '../images.js';

export default (sketch, { name, avatarId, isFired }, xPos, yPos) => {
  sketch.image(images.avatarImages[avatarId], xPos, yPos);
  sketch.textSize(18);
  sketch.fill(255);
  sketch.textStyle(sketch.BOLD);
  sketch.text(name, xPos, yPos + 50);
  if (isFired) {
    sketch.image(images.fired, xPos, yPos);
  }
};
