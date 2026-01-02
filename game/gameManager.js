const { v4: uuidv4 } = require("uuid");
const { createBoard, dropDisc } = require("./board");
const { checkWin, isDraw } = require("./rules");
const { getBotMove } = require("./bot");
const { saveGameResult, incrementWin } = require("../db/mongo");
const { sendEvent } = require("../kafka/producer");

const activeGames = new Map();

function createGame(io, p1, p2) {
  const gameId = uuidv4();

  const game = {
    id: gameId,
    board: createBoard(),
    players: {
      P1: { socket: p1.socket, username: p1.username, connected: true },
      P2: p2
        ? { socket: p2.socket, username: p2.username, connected: true }
        : { bot: true, username: "BOT" },
    },
    turn: "P1",
    ended: false,
    disconnectTimers: {},
  };

  activeGames.set(gameId, game);

  p1.socket.join(gameId);
  if (p2) p2.socket.join(gameId);

  io.to(gameId).emit("game_start", {
    gameId,
    board: game.board,
    turn: game.turn,
  });

  sendEvent("GAME_STARTED", {
    gameId,
    players: [game.players.P1.username, game.players.P2.username],
  });

  return gameId;
}

// ---------------- MOVE HANDLING ----------------
function handleMove(io, socket, { gameId, column, username }) {
  const game = activeGames.get(gameId);
  if (!game || game.ended) return;

  const currentKey = game.turn;
  const player = game.players[currentKey];

  if (player.bot) return;
  if (player.username !== username) return;

  const row = dropDisc(game.board, column, currentKey);
  if (row === null) return;

  sendEvent("MOVE_PLAYED", {
    gameId,
    player: player.username,
    column,
  }).catch(console.error);

  if (checkWin(game.board, currentKey)) {
    return endGame(io, gameId, player.username);
  }

  if (isDraw(game.board)) {
    return endGame(io, gameId, null);
  }

  game.turn = currentKey === "P1" ? "P2" : "P1";

  io.to(gameId).emit("state_update", {
    board: game.board,
    turn: game.turn,
  });

  if (game.players[game.turn].bot) {
    setTimeout(() => botMove(io, gameId), 400);
  }
}

// ---------------- BOT MOVE ----------------
function botMove(io, gameId) {
  const game = activeGames.get(gameId);
  if (!game || game.ended) return;

  const col = getBotMove(game.board);
  dropDisc(game.board, col, "P2");
  sendEvent("MOVE_PLAYED", {
    gameId,
    player: "BOT",
    column: col,
  }).catch(console.error);

  if (checkWin(game.board, "P2")) {
    return endGame(io, gameId, "BOT");
  }

  if (isDraw(game.board)) {
    return endGame(io, gameId, null);
  }

  game.turn = "P1";

  io.to(gameId).emit("state_update", {
    board: game.board,
    turn: game.turn,
  });
}

// ---------------- DISCONNECT ----------------
function handleDisconnect(io, socket) {
  for (let [gameId, game] of activeGames) {
    if (game.ended) continue;

    for (let key of ["P1", "P2"]) {
      const player = game.players[key];
      if (player.bot) continue;

      if (player.socket.id === socket.id) {
        player.connected = false;

        game.disconnectTimers[key] = setTimeout(() => {
          if (game.ended) return;

          const winner =
            key === "P1" ? game.players.P2.username : game.players.P1.username;

          endGame(io, gameId, winner);
        }, 30000);
      }
    }
  }
}

// ---------------- RECONNECT ----------------
function reconnectPlayer(io, socket, username, gameId) {
  const game = activeGames.get(gameId);
  if (!game || game.ended) return;

  for (let key of ["P1", "P2"]) {
    const player = game.players[key];
    if (player.username === username) {
      clearTimeout(game.disconnectTimers[key]);
      player.socket = socket;
      player.connected = true;

      socket.join(gameId);
      socket.emit("state_update", {
        board: game.board,
        turn: game.turn,
      });
    }
  }
}

// ---------------- END GAME ----------------
async function endGame(io, gameId, winner) {
  const game = activeGames.get(gameId);
  if (!game || game.ended) return;

  game.ended = true;

  if (winner) {
    await incrementWin(winner);
  }

  await saveGameResult({
    players: [game.players.P1.username, game.players.P2.username],
    winner: winner || "DRAW",
    endedAt: new Date(),
  });

  io.to(gameId).emit("game_over", { winner });
  sendEvent("GAME_ENDED", {
    gameId,
    winner: winner || "DRAW",
    players: [game.players.P1.username, game.players.P2.username],
  }).catch(console.error);

  activeGames.delete(gameId);
}

module.exports = {
  createGame,
  handleMove,
  handleDisconnect,
  reconnectPlayer,
};
