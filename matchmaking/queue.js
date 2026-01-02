const { createGame } = require("../game/gameManager");

let waitingPlayer = null;
let timer = null;

function joinQueue(io, socket, username) {
  if (!waitingPlayer) {
    waitingPlayer = { socket, username };

    timer = setTimeout(() => {
      createGame(io, waitingPlayer, null); // bot game
      waitingPlayer = null;
    }, 10000);
  } else {
    clearTimeout(timer);
    createGame(io, waitingPlayer, { socket, username });
    waitingPlayer = null;
  }
}

module.exports = { joinQueue };
