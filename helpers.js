module.exports = {
  shuffle(original) {
    const array = [...original];
    const shuffled = [];
    let n = array.length;
    let i;

    while (n) {
      i = Math.floor(Math.random() * n--);
      shuffled.push(array.splice(i, 1)[0]);
    }

    return shuffled;
  },
};
