/* eslint-disable */

const path = require('path');
const express = require('express');
const socket = require('socket.io');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static(path.join(__dirname, './public')));

const expressServer = app.listen(PORT, () => console.log('Server running on port', PORT));
const socketServer = socket(expressServer);


// eslint-disable

const ROLES = [
  'DEVELOPER',
  'TECH_LEAD',
  'HACKER',
];

class Player {
  constructor(name, role) {
    this.name = name
    this.role = role
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
    this.players.push(player)

  }
}

class Game {
  constructor() {
    this.players = [];
  }
}

const players = new Set();


socketServer.sockets.on('connect', (newSocket) => {
  console.log(newSocket.id, 'connected');
  let playerInstance = null;

  newSocket.on('login', (name, assignRole) => {
    console.log('received login event from', name);
    playerInstance = new Player(name, ROLES[2]);
    players.add(playerInstance);
    assignRole(playerInstance.role);
  });

  newSocket.on('disconnect', () => {
    console.log(newSocket.id, 'disconnected');
    if (playerInstance) players.delete(playerInstance);
  });
});
