/* eslint-disable */

const path = require("path");
const express = require("express");
const socket = require("socket.io");
const { runInThisContext } = require("vm");
const { listen } = require("socket.io");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static(path.join(__dirname, "./public")));

const expressServer = app.listen(PORT, () =>
  console.log("Server running on port", PORT)
);
const socketServer = socket(expressServer);

// eslint-disable

const ROLES = ["DEVELOPER", "TECH_LEAD", "HACKER"];

class Player {
  constructor(name, role) {
    this.name = name;
    this.role = ROLES[0];
    // avatar?
    //
  }
}

class Service {
  constructor(name) {
    this.name = name;
    this.lives = 3;
    this.isImmunised = false;
    this.players = [];
  }

  hack() {
    if (this.isImmunised) {
      console.log("attempted hack on", this.name, "but was immunised");

      this.isImmunised = false;

      // notify assigned players of hack attempt
    } else {
      console.log(this.name, "was hacked!!!!");
      this.lives -= 1;

      // check if lives depleted and something
    }
  }

  assignPlayer(player) {
    this.players.push(player);
  }
}

class Game {
  constructor() {
    this.isStarted = false;
    this.players = new Set();
  }
  addPlayer(name) {
    const playerInstance = new Player(
      name,
      ROLES[Math.floor(Math.random() * 3)]
    );
    this.players.add(playerInstance);
    return playerInstance;
  }
  removePlayer(player) {
    this.players.delete(player);
    if (this.players.size === 0) this.end();
  }

  start() {
    this.isStarted = true;
    console.log("game started");
    socketServer.emit("gameStarted");
    let chosenOnes = new Set();
    while (chosenOnes.size < 3) {
      chosenOnes.add(Math.floor(Math.random() * this.players.size));
    }
    chosenOnes = [...chosenOnes];
    const playersArray = [...this.players];
    playersArray[chosenOnes[0]].role = ROLES[1];
    playersArray[chosenOnes[1]].role = ROLES[2];
    playersArray[chosenOnes[2]].role = ROLES[2];
    console.log(this.players);
  }

  end() {
    this.isStarted = false;
  }
}

const game = new Game();

socketServer.sockets.on("connect", (newSocket) => {
  console.log(newSocket.id, "connected");
  let playerInstance = null;

  newSocket.on("login", (name) => {
    console.log("received login event from", name);
    playerInstance = game.addPlayer(name);
    // assignRole(playerInstance.role);
  });

  newSocket.on("gameStart", () => {
    if (game.isStarted) return;
    game.start();
  });

  newSocket.on("disconnect", () => {
    console.log(newSocket.id, "disconnected");
    if (playerInstance) game.removePlayer(playerInstance);
  });
});
