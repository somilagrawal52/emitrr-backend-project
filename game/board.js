const ROWS = 6;
const COLS = 7;

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function dropDisc(board, col, player) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!board[r][col]) {
      board[r][col] = player;
      return r;
    }
  }
  return null;
}

module.exports = { createBoard, dropDisc };
