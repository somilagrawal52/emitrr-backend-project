const { dropDisc } = require("./board");
const { checkWin } = require("./rules");

function getBotMove(board) {
  // Try to win
  for (let c = 0; c < 7; c++) {
    const temp = board.map((r) => [...r]);
    if (dropDisc(temp, c, "BOT") !== null && checkWin(temp, "BOT")) {
      return c;
    }
  }

  // Block opponent
  for (let c = 0; c < 7; c++) {
    const temp = board.map((r) => [...r]);
    if (dropDisc(temp, c, "PLAYER") !== null && checkWin(temp, "PLAYER")) {
      return c;
    }
  }

  // Prefer center
  const preferred = [3, 2, 4, 1, 5, 0, 6];
  for (let c of preferred) {
    const temp = board.map((r) => [...r]);
    if (dropDisc(temp, c, "BOT") !== null) {
      return c;
    }
  }
}

module.exports = { getBotMove };
