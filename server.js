const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
dotenv.config();
const {
  createGame,
  handleMove,
  handleDisconnect,
  reconnectPlayer,
} = require("./game/gameManager");
const { getLeaderboard } = require("./db/mongo");
const { connectProducer } = require("./kafka/producer");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => res.render("index"));
app.get("/leaderboard", async (req, res) => {
  try {
    const leaderboard = await getLeaderboard();
    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Leaderboard fetch failed" });
  }
});

let waitingPlayer = null;
let waitingTimer = null;

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_game", ({ username }) => {
    socket.username = username;

    if (!waitingPlayer) {
      waitingPlayer = { socket, username };

      waitingTimer = setTimeout(() => {
        if (waitingPlayer) {
          console.log("Starting bot game");
          createGame(io, waitingPlayer, null);
          waitingPlayer = null;
        }
      }, 10000);

      socket.emit("waiting");
      return;
    }

    clearTimeout(waitingTimer);
    createGame(io, waitingPlayer, { socket, username });
    waitingPlayer = null;
  });

  // ✅ GAME EVENTS
  socket.on("move", (data) => {
    handleMove(io, socket, data);
  });

  socket.on("reconnect_game", ({ username, gameId }) => {
    reconnectPlayer(io, socket, username, gameId);
  });

  socket.on("disconnect", () => {
    handleDisconnect(io, socket);
  });
});
connectProducer().catch(console.error);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
