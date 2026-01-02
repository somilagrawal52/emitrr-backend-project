const {
  createGame,
  handleMove,
  handleDisconnect,
  reconnectPlayer,
} = require("./game/gameManager");

const waitingQueue = [];
let queueTimer = null;

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    // ---------- JOIN MATCHMAKING ----------
    socket.on("join", ({ username }) => {
      socket.username = username;

      if (waitingQueue.length === 0) {
        waitingQueue.push(socket);

        queueTimer = setTimeout(() => {
          const p1 = waitingQueue.shift();
          createGame(io, { socket: p1, username: p1.username }, null);
        }, 10000);
      } else {
        clearTimeout(queueTimer);
        const p1 = waitingQueue.shift();
        createGame(
          io,
          { socket: p1, username: p1.username },
          { socket, username }
        );
      }
    });

    // ---------- HANDLE MOVE ----------
    socket.on("move", (data) => {
      handleMove(io, socket, data);
    });

    // ---------- RECONNECT ----------
    socket.on("reconnect_game", ({ username, gameId }) => {
      reconnectPlayer(io, socket, username, gameId);
    });

    socket.on("game_start", (data) => {
      console.log("GAME START DATA:", data);
    });

    // ---------- DISCONNECT ----------
    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id);
      handleDisconnect(io, socket);
    });
  });
};
