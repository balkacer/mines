const levels = {
  easy: {
    cols: 8,
    rows: 8,
    mines: 10,
  },
  medium: {
    cols: 12,
    rows: 12,
    mines: 20,
  },
  hard: {
    cols: 16,
    rows: 16,
    mines: 40,
  },
  expert: {
    cols: 20,
    rows: 20,
    mines: 80,
  },
};
let isGameStarted = false;
const score = document.getElementById("score");

function generateBoard(level) {
  const { cols, rows, mines } = levels[level || "easy"];

  const board = Array(rows)
    .fill(0)
    .map((_) =>
      Array(cols)
        .fill(0)
        .map((_) => ({
          isMine: false,
          isOpened: false,
          isFlagged: false,
          closeMines: 0,
          neighbors: [],
        }))
    );

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const neighbors = [
        {
          row: row - 1,
          col: col - 1,
        },
        {
          row: row - 1,
          col: col,
        },
        {
          row: row - 1,
          col: col + 1,
        },
        {
          row: row,
          col: col - 1,
        },
        {
          row: row,
          col: col + 1,
        },
        {
          row: row + 1,
          col: col - 1,
        },
        {
          row: row + 1,
          col: col,
        },
        {
          row: row + 1,
          col: col + 1,
        },
      ];
      board[row][col].neighbors = [
        ...neighbors.filter(
          (neighbor) =>
            neighbor.row >= 0 &&
            neighbor.col >= 0 &&
            neighbor.row < rows &&
            neighbor.col < cols
        ),
      ];
    }
  }

  return {
    board,
    mines,
    rows,
    cols,
  };
}

let boardData = generateBoard("easy");

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function setMines(initClickCell) {
  const { rows, cols, mines, board } = boardData;
  const [initRow, initCol] = initClickCell;

  for (let i = 0; i < mines; i++) {
    const row = Math.floor(getRandomArbitrary(0, rows));
    const col = Math.floor(getRandomArbitrary(0, cols));

    if (initRow === row && initCol === col) {
      i--;
      continue;
    }

    if (boardData.board[row][col].isMine) {
      i--;
      continue;
    }

    boardData.board[row][col].isMine = true;
  }

  boardData.board.map((row, rowIndex) => {
    row.map((col, colIndex) => {
      if (boardData.board[rowIndex][colIndex].isMine) {
        const cell = document.getElementById(`cell-${rowIndex}-${colIndex}`);
        cell.classList.add("mine");
        cell.innerHTML = "<span>💣</span>";
      } else {
        const closeMines = boardData.board[rowIndex][colIndex].neighbors.filter(
          (n) => board[n.row][n.col].isMine
        ).length;
        boardData.board[rowIndex][colIndex].closeMines = closeMines;
        const cell = document.getElementById(`cell-${rowIndex}-${colIndex}`);
        cell.innerHTML = `<span>${closeMines > 0 ? closeMines : ""}</span>`;
      }
    });
  });
}

function handleClick(el, row, col) {
  if (!isGameStarted) {
    setMines([row, col]);
    isGameStarted = true;
  }

  if (!boardData.board[row][col].isOpened && !boardData.board[row][col].isFlagged) {
    boardData.board[row][col].isOpened = true;
    el.classList.add("opened");
  }
}

function handleRightClick(el, row, col) {
  console.log(row, col);
  if (!boardData.board[row][col].isOpened) {
    el.classList.toggle("flagged");
    const _score = score.innerText.split(": ")[1];
    
    if (boardData.board[row][col].isFlagged) {
      boardData.board[row][col].isFlagged = false;
      score.innerText = `Rest mines: ${parseInt(_score) + 1}`;
    } else {
      boardData.board[row][col].isFlagged = true;
      score.innerText = `Rest mines: ${parseInt(_score) - 1}`;
    }
  }
}

function handleDifficultyChange(e) {
  const level = e.target.value;
  boardData = generateBoard(level);
  score.innerText = boardData.mines;
  isGameStarted = false;
  main();
}

function main() {
  const difficultySelector = document.getElementById("difficulty");
  difficultySelector.addEventListener("change", handleDifficultyChange);

  score.innerText = `Rest mines: ${boardData.mines}`;

  let fragment = new DocumentFragment();

  boardData.board.map((row, rowIndex) => {
    row.map((_, colIndex) => {
      const cell = document.createElement("div");
      cell.id = `cell-${rowIndex}-${colIndex}`;
      cell.classList.add("cell");
      
      cell.addEventListener("click", (e) => {
        e.preventDefault();
        handleClick(e.target, rowIndex, colIndex);
      });
      
      cell.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        handleRightClick(e.target, rowIndex, colIndex);
      });

      fragment.appendChild(cell);
    });
  });

  const _board = document.getElementById("board");
  _board.style["grid-template-columns"] = `repeat(${boardData.cols}, 1fr)`;
  _board.style["grid-template-rows"] = `repeat(${boardData.rows}, 1fr)`;
  _board.innerHTML = "";
  _board.appendChild(fragment);
}

main();
