/* eslint-disable max-classes-per-file */
const path = require('path');
const express = require('express');
const socket = require('socket.io');
const { shuffle } = require('./helpers');

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
    this.workers = [];
  }

  // hack() {
  //   if (this.isImmunised) {
  //     console.log('attempted hack on', this.name, 'but was immunised');

  //     this.isImmunised = false;

  //     // notify assigned players of hack attempt
  //   } else {
  //     console.log(this.name, 'was hacked!!!!');
  //     this.lives -= 1;

  //     // check if lives depleted and something
  //   }
  // }

  clearWorkers() {
    this.workers.length = 0;
  }

  assignWorker(player) {
    this.workers.push({
      name: player.name,
      avatarId: player.avatarId,
    });
  }
}

class Game {
  static avatarCounter = 0;

  constructor() {
    this.isStarted = false;
    this.dayCounter = 0;
    this.players = [];
    this.services = [
      new Service('VAS'),
      new Service('DPG'),
      new Service('EVENTSINK'),
      new Service('yourFace'),
    ];
  }

  addPlayer(name, playerSocket) {
    const playerInstance = new Player(name, playerSocket, Game.avatarCounter++);
    this.players.push(playerInstance);
    return playerInstance;
  }

  removePlayer(player) {
    const i = this.players.indexOf(player);
    if (i !== -1) this.players.splice(i, 1);
    if (this.players.length === 0) this.end();
  }

  start() {
    this.isStarted = true;
    console.log('starting game...');
    let chosenOnes = new Set();
    while (chosenOnes.size < N_HACKERS + 1) { // + 1 for the tech lead
      chosenOnes.add(Math.floor(Math.random() * this.players.length));
    }
    chosenOnes = [...chosenOnes];
    this.players.forEach(p => p.role = ROLES[0]);
    this.players[chosenOnes[0]].role = ROLES[1];
    this.players[chosenOnes[1]].role = ROLES[2];
    this.players[chosenOnes[2]].role = ROLES[2];

    this.players.forEach(p => p.sendMessage('gameStarted', [p.role, p.avatarId]));
    console.log('game started with players:', this.players.map(p => p.name));
    this.newDay();
  }

  end() {
    this.isStarted = false;
    Game.avatarCounter = 0;
  }

  newDay() {
    this.dayCounter++;
    console.log('day', this.dayCounter, 'started');

    const shuffledPlayers = shuffle(this.players);
    console.log(shuffledPlayers.map(p => p.name))
    const maxPlayersPerService = 3;
    this.services.forEach((s, serviceIndex) => {
      s.clearWorkers();
      for (let i = 0; i < maxPlayersPerService; i++) {
        const player = shuffledPlayers[serviceIndex * maxPlayersPerService + i];
        if (!player) return;
        console.log('assigning', player.name, 'to', s.name);
        s.assignWorker(player);
      }
    });

    socketServer.emit('newDay', this.services);

  }
}

const game = new Game();

socketServer.sockets.on('connect', (newSocket) => {
  console.log(newSocket.id, 'connected');
  let playerInstance = null;

  newSocket.on('login', (name) => {
    console.log('received login event from', name);
    playerInstance = game.addPlayer(name, newSocket);
    if (game.players.length >= MIN_PLAYERS) {
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
