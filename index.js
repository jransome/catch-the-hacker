const path = require('path');
const express = require('express');
const socket = require('socket.io');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static(path.join(__dirname, './public')));

const expressServer = app.listen(PORT, () => console.log('Server running on port', PORT));
const socketServer = socket(expressServer);

// const players = new Set();
// let hostPlayer = null;

// class Player {
//   constructor(name, role){
//     this.name = name
//     this.role = role
//     // avatar?
//     // 
//   }


// }



// class Game {

// }

socketServer.sockets.on('connect', (newSocket) => {
  console.log(newSocket.id, 'connected');

  newSocket.on('login', (name) => {
    console.log('received login event from', name);
  });

  newSocket.on('disconnect', () => {
    console.log(newSocket.id, 'disconnected');
  });
});
