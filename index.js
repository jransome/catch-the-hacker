/* eslint-disable max-classes-per-file */
const path = require('path');
const express = require('express');
const socket = require('socket.io');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static(path.join(__dirname, './public')));

const expressServer = app.listen(PORT, () => console.log('Server running on port', PORT));
const socketServer = socket(expressServer);

const ROLES = ['DEVELOPER', 'TECH_LEAD', 'HACKER'];
const MIN_PLAYERS = 3;
const N_HACKERS = 2;

class Player {
  constructor(name, playerSocket, avatarId) {
    this.name = name;
    this.socket = playerSocket;
    this.role = null;
    this.avatarId = avatarId;
  }

  sendMessage(eventName, args) {
    this.socket.emit(eventName, ...args);
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
      console.log('attempted hack on', this.name, 'but was immunised');

      this.isImmunised = false;

      // notify assigned players of hack attempt
    } else {
      console.log(this.name, 'was hacked!!!!');
      this.lives -= 1;

      // check if lives depleted and something
    }
  }

  assignPlayer(player) {
    this.players.push(player);
  }
}

class Game {
  static avatarCounter = 0;

  constructor() {
    this.isStarted = false;
    this.players = new Set();
    this.services = {
      "VAS": new Service('VAS'),
      "DPG": new Service('DPG'),
      "EVENTSINK": new Service ('EVENTSINK')
    }  
  }

  addPlayer(name, playerSocket) {
    const playerInstance = new Player(name, playerSocket, Game.avatarCounter++);
    this.players.add(playerInstance);
    return playerInstance;
  }

  removePlayer(player) {
    this.players.delete(player);
    if (this.players.size === 0) this.end();
  }

  start() {
    this.isStarted = true;
    console.log('starting game...');
    let chosenOnes = new Set();
    while (chosenOnes.size < N_HACKERS + 1) { // + 1 for the tech lead
      chosenOnes.add(Math.floor(Math.random() * this.players.size));
    }
    chosenOnes = [...chosenOnes];
    const playersArray = [...this.players];
    playersArray.forEach(p => p.role = ROLES[0]);
    playersArray[chosenOnes[0]].role = ROLES[1];
    playersArray[chosenOnes[1]].role = ROLES[2];
    playersArray[chosenOnes[2]].role = ROLES[2];

    playersArray.forEach(p => p.sendMessage('gameStarted', [p.role, p.avatarId]));
    console.log('game started with players:', this.players);
    socketServer.emit("newDay",this.services);
  }



  end() {
    this.isStarted = false;
    Game.avatarCounter = 0;
  }
}

const game = new Game();

socketServer.sockets.on('connect', (newSocket) => {
  console.log(newSocket.id, 'connected');
  let playerInstance = null;

  newSocket.on('login', (name) => {
    console.log('received login event from', name);
    playerInstance = game.addPlayer(name, newSocket);
    if (game.players.size >= MIN_PLAYERS) {
      socketServer.emit('canStart');
    }
  });

  newSocket.on('gameStart', () => {
    if (game.isStarted) return;
    game.start();
  });

  newSocket.on('disconnect', () => {
    console.log(newSocket.id, playerInstance && playerInstance.name, 'disconnected');
    if (playerInstance) game.removePlayer(playerInstance);
  });
});
