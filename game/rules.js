function checkWin(board, player) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 7; c++) {
      if (board[r][c] !== player) continue;

      for (let [dr, dc] of directions) {
        let count = 0;
        for (let i = 0; i < 4; i++) {
          let nr = r + dr * i;
          let nc = c + dc * i;
          if (
            nr < 0 ||
            nr >= 6 ||
            nc < 0 ||
            nc >= 7 ||
            board[nr][nc] !== player
          )
            break;
          count++;
        }
        if (count === 4) return true;
      }
    }
  }
  return false;
}

function isDraw(board) {
  return board[0].every((cell) => cell !== null);
}

module.exports = { checkWin, isDraw };
