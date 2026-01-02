console.log("✅ client.js loaded");

const socket = io();

let gameId = localStorage.getItem("gameId");
let username = "";
let board = [];

const boardDiv = document.getElementById("board");
const turnDiv = document.getElementById("turn");
const resultDiv = document.getElementById("result");

// -------- JOIN GAME --------
function joinGame() {
  username = document.getElementById("username").value;
  if (!username) return;

  socket.emit("join_game", { username });
}

// -------- RECONNECT --------
function reconnectGame() {
  username = document.getElementById("username").value;
  if (!username || !gameId) return;

  socket.emit("reconnect_game", { username, gameId });
}

// -------- RENDER BOARD --------
function renderBoard(board) {
  boardDiv.innerHTML = "";
  boardDiv.style.display = "grid";
  boardDiv.style.gridTemplateColumns = "repeat(7, 50px)";
  boardDiv.style.gridTemplateRows = "repeat(6, 50px)";
  boardDiv.style.gap = "2px";

  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      const div = document.createElement("div");
      div.className = "cell";

      div.onclick = () => makeMove(c);

      if (board[r][c] === "P1") div.classList.add("p1");
      if (board[r][c] === "P2") div.classList.add("p2");

      boardDiv.appendChild(div);
    }
  }
}

// -------- MAKE MOVE --------
function makeMove(column) {
  if (!gameId) return;

  socket.emit("move", {
    gameId,
    column,
    username,
  });
}

// -------- SOCKET EVENTS --------
socket.on("game_start", (data) => {
  gameId = data.gameId;
  localStorage.setItem("gameId", gameId);

  board = data.board;
  renderBoard(board);
  turnDiv.innerText = `Turn: ${data.turn}`;
  resultDiv.innerText = "";
});

socket.on("state_update", (data) => {
  board = data.board;
  renderBoard(board);
  turnDiv.innerText = `Turn: ${data.turn}`;
});

socket.on("game_over", ({ winner }) => {
  resultDiv.innerText = winner ? `${winner} won!` : "Draw";
  localStorage.removeItem("gameId");
});

// -------- LOAD LEADERBOARD --------
fetch("/leaderboard")
  .then((res) => res.json())
  .then((data) => {
    const ul = document.getElementById("leaderboard");
    ul.innerHTML = "";
    data.forEach((p) => {
      const li = document.createElement("li");
      li.innerText = `${p.username}: ${p.wins}`;
      ul.appendChild(li);
    });
  });
