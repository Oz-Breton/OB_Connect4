const startVs = document.querySelector('#vs');
const WIDTH = 7;
const HEIGHT = 6;

let currPlayer = 1;
let board = [];

startVs.addEventListener('click', (e) => {
  initGame(e);
});

function initGame(e) {
  board = makeBoard();
  makeHtmlBoard();
  e.target.remove();
  currPlayer = 1;
}

function makeBoard() {
  let tempBoard = [];
  for (let r = 0; r < HEIGHT; r++) {
    let tempArr = [];
    for (let c = 0; c < WIDTH; c++) {
      tempArr.push(0);
    }
    tempBoard.push(tempArr);
  }
  return tempBoard;
}

function makeHtmlBoard() {
  const htmlBoard = document.querySelector('#board')
  const top = document.createElement("tr");

  top.setAttribute("id", "column-top");
  top.addEventListener("click", handleClick);

  for (let x = 0; x < WIDTH; x++) {
    const headCell = document.createElement("td");
    headCell.setAttribute("id", x);
    top.append(headCell);
  }
  htmlBoard.append(top);

  for (let y = 0; y < HEIGHT; y++) {
    const row = document.createElement("tr");
    for (let x = 0; x < WIDTH; x++) {
      const cell = document.createElement("td");
      cell.setAttribute("id", `${y}-${x}`);
      row.append(cell);
    }
    htmlBoard.append(row);
  }
}

function findSpotForCol(x) {
  for (let i = HEIGHT - 1; i >= 0; i--) {
    if (board[i][x] === 0) {
      return i;
    }
  }
  return null;
}

function placeInTable(y, x) {
  const newP = document.createElement('div');
  newP.classList.add('piece');
  newP.classList.add(currPlayer === 1 ? 'p1' : 'p2');
  const selectedSq = document.getElementById(y + '-' + x);
  selectedSq.append(newP);
}

function endGame(msg) {
  alert(msg);
  currPlayer = 3;
  const resetBtn = document.createElement('button');
  const body = document.querySelector('body');
  resetBtn.id = 'reset';
  resetBtn.innerText = 'Reset the Game';
  resetBtn.addEventListener('click', () => {
    resetBtn.remove();
    document.querySelector('#board').innerHTML = '';
    const newVS = document.createElement('button');
    newVS.id = 'vs';
    newVS.innerText = 'Start Game';
    newVS.addEventListener('click', (e) => {
      initGame(e);
    });
    body.append(newVS);

  });
  body.append(resetBtn);
}

function handleClick(evt) {
  if (currPlayer < 3) {
    let x = +evt.target.id;
    let y = findSpotForCol(x);
    if (y === null) {
      return;
    }

    board[y][x] = currPlayer;
    placeInTable(y, x);

    if (checkForWin()) {
      return endGame(`Player ${currPlayer} won!`);
    }

    if (board.every(row => row.every(val => val > 0))) {
      endGame('You Tied!');
    }

    currPlayer = currPlayer === 1 ? 2 : 1;
  }
}

function checkForWin() {
  function _win(cells) {
    return cells.every(
      ([y, x]) =>
        y >= 0 &&
        y < HEIGHT &&
        x >= 0 &&
        x < WIDTH &&
        board[y][x] === currPlayer
    );
  }

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
      const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
      const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
      const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

      if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
        return true;
      }
    }
  }
}