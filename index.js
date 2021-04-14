/* eslint-disable max-classes-per-file */
const path = require("path");
const express = require("express");
const socket = require("socket.io");
const { shuffle } = require("./helpers");

const NIGHT_LENGTH = 10000;

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static(path.join(__dirname, "./public")));

const expressServer = app.listen(PORT, () =>
  console.log("Server running on port", PORT)
);
const socketServer = socket(expressServer);

const ROLES = ["DEVELOPER", "TECH_LEAD", "HACKER"];
const MIN_PLAYERS = 3;
const N_HACKERS = 2;

class Player {
  constructor(name, playerSocket, avatarId) {
    this.name = name;
    this.socket = playerSocket;
    this.isFired = false;
    this.role = null;
    this.avatarId = avatarId;
    this.accusers = [];
  }

  get clientData() {
    return {
      name: this.name,
      avatarId: this.avatarId,
      accusers: this.accusers,
      isFired: this.isFired,
    }
  }

  sendMessage(eventName, args) {
    this.socket.emit(eventName, ...args);
  }

  gotAccusedBy(accuser) {
    this.accusers.push(accuser)
  }

  fire() {
    this.isFired = true;
  }

  clearAccusers() {
    this.accusers.length = 0;
  }
}

class Service {
  constructor(name) {
    this.name = name;
    this.lives = 3;
    this.isImmunised = false;
    this.workers = [];
    this.hackedLastNight = false;
  }

  hack() {
    if (this.isImmunised) {
      console.log('attempted hack on', this.name, 'but was immunised');
      this.isImmunised = false;

      // notify assigned players of hack attempt
    } else {
      console.log(this.name, 'was hacked!!!!');
      this.hackedLastNight = true;
      this.lives -= 1;

      // if lives === 0, then hackers have won the game
    }
  }

  clearWorkers() {
    this.workers.length = 0;
  }

  assignWorker(player) {
    this.workers.push(player.clientData);
  }
}

class Game {
  static avatarCounter = 0;

  constructor() {
    this.isStarted = false;
    this.dayCounter = 0;
    this.players = [];
    this.accusers = [];
    this.services = [];
  }

  get activePlayers() {
    return this.players.filter(p => !p.isFired);
  }

  addPlayer(name, playerSocket) {
    const playerInstance = new Player(name, playerSocket, Game.avatarCounter++);
    this.players.push(playerInstance);

    playerSocket.on('hacked', this._onServiceHacked.bind(this));
    playerSocket.on('voteCast', this._onVoteCast.bind(this));

    return playerInstance;
  }

  removePlayer(player) {
    const i = this.players.indexOf(player);
    if (i !== -1) this.players.splice(i, 1);
    if (this.players.length === 0) this.end();
  }

  start() {
    this.isStarted = true;
    console.log("starting game...");

    // setup services
    this.services = [
      new Service("VAS"),
      new Service("DPG"),
      new Service("EVENTSINK"),
      new Service("yourFace"),
    ];

    // choose hackers and tech lead
    let chosenOnes = new Set(); 
    while (chosenOnes.size < N_HACKERS + 1) { // + 1 for the tech lead
      chosenOnes.add(Math.floor(Math.random() * this.players.length));
    }
    chosenOnes = [...chosenOnes];
    this.players.forEach((p) => (p.role = ROLES[0]));
    this.players[chosenOnes[0]].role = ROLES[1];
    this.players[chosenOnes[1]].role = ROLES[2];
    this.players[chosenOnes[2]].role = ROLES[2];

    this.players.forEach((p) =>
      p.sendMessage('gameStarted', [p.clientData, p.role])
    );
    console.log(
      "game started with players:",
      this.players.map((p) => p.name)
    );

    this._nightfall();
  }

  end() {
    this.isStarted = false;
    Game.avatarCounter = 0;
  }

  _sunrise() {
    this.dayCounter++;
    console.log("day", this.dayCounter, "started...");

    // 1. alert everyone (if service hacked) people need to stay wheree they were during the night so discussion can happen
    socketServer.emit('sunrise', this.services);
    this._emitUpdatePlayers();
  }

  _shuffleWorkers() {
    console.log('shuffling workers...')
    const shuffledPlayers = shuffle(this.activePlayers);

    const maxPlayersPerService = 3;
    this.services.forEach((s, serviceIndex) => {
      s.clearWorkers();
      for (let i = 0; i < maxPlayersPerService; i++) {
        const player = shuffledPlayers[serviceIndex * maxPlayersPerService + i];
        if (!player) return;
        console.log("assigning", player.name, "to", s.name);
        s.assignWorker(player);
      }
    });
    console.log('workers shuffled')

    socketServer.emit('reshuffle', this.services);
  }

  _nightfall() {
    console.log('nightfall started. Shuffling workers...')
    this._shuffleWorkers();
    this.services.forEach(s => s.hackedLastNight = false);

    // allow hacks to happen
    // allow immunisation to happen
    socketServer.emit('nightfall', this.services);

    // set 1 minute timer till sunrise
    setTimeout(() => {
      console.log('nightfall ended')
      this._sunrise();
    }, NIGHT_LENGTH);
  }

  _emitUpdatePlayers() {
    socketServer.emit('playersUpdated', this.players.map(p => p.clientData));
  }

  _onServiceHacked(serviceName) {
    const hackedService = this.services.find(s => s.name === serviceName)
    hackedService && hackedService.hack()
  }

  _onVoteCast({ accuser, accused }) {
    const accusedPlayer = this.players.find(p => p.name === accused.name);
    accusedPlayer.gotAccusedBy(accuser);
    this._emitUpdatePlayers();
    this.accusers.push(accuser);

    if (this.accusers.length === this.activePlayers.length) { // everybody's voted
      const fired = this.players.reduce((highestVotedSoFar, p) => { // find the most accused player
        return p.accusers.length > highestVotedSoFar.accusers.length ? p : highestVotedSoFar;
      });

      console.log(fired.name, 'was FIRED');
      fired.fire();

      // reset stuff
      this.accusers.length = 0;
      this.players.forEach(p => p.clearAccusers());
      
      this._shuffleWorkers();
      this._emitUpdatePlayers();
      this._nightfall();
    }
  }
}

const game = new Game();

socketServer.sockets.on("connect", (newSocket) => {
  console.log(newSocket.id, "connected");
  let playerInstance = null;

  newSocket.on("login", (name) => {
    console.log("received login event from", name);
    playerInstance = game.addPlayer(name, newSocket);
    if (game.players.length >= MIN_PLAYERS) {
      socketServer.emit("canStart");
    }
  });

  newSocket.on("gameStart", () => {
    if (game.isStarted) return;
    game.start();
  });

  newSocket.on("disconnect", () => {
    console.log(
      newSocket.id,
      playerInstance && playerInstance.name,
      "disconnected"
    );
    if (playerInstance) game.removePlayer(playerInstance);
  });
});
