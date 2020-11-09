module.exports = {
  shuffle(array) {
    const suffled = [];
    let n = array.length;
    let i;

    while (n) {
      i = Math.floor(Math.random() * n--);
      suffled.push(array.splice(i, 1)[0]);
    }

    return suffled;
  },
};
