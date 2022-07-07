const buttons = document.querySelector('fieldset');

const WIDTH = 7;
const HEIGHT = 6;

let currPlayer = 1;
let board = [];
let AiActive = false;

function makeAiMove() {
  const determineAiMove = () => {
    const oppPlayer = 1;
    const determineAllPossibleMoves = (board) => {
      let tempArr = [];
      for (let i = 0; i < WIDTH; i++) {
        if (typeof findSpotForCol(i, board) === 'number') {
          tempArr.push([findSpotForCol(i, board), i])
        }
      }
      return tempArr;
    }
    const allPossibleMoves = determineAllPossibleMoves(board);
    const determineBasicAiMove = (moves, player, board) => {
      const oppPlayer = player === 1 ? 2 : 1;
      for (let move of moves) {
        const tempBoard = structuredClone(board);
        let [y, x] = move;
        tempBoard[y][x] = player;
        if (checkForWin(tempBoard, player)) {
          return move;
        }
      }
      for (let move of moves) {
        const tempBoard = structuredClone(board);
        let [y, x] = move;
        tempBoard[y][x] = oppPlayer;
        if (checkForWin(tempBoard, oppPlayer)) {
          return move;
        }
      }
      return randomElement(moves);
    }
    let allReasonableMoves = [];
    for (let move of allPossibleMoves){
      const tempBoard = structuredClone(board);
      let [y, x] = move;
      tempBoard[y][x] = currPlayer;
      const oppNextMove = determineBasicAiMove(determineAllPossibleMoves(tempBoard), oppPlayer, tempBoard);
      [y, x] = oppNextMove;
      tempBoard[y][x] = oppPlayer;
      if (!checkForWin(tempBoard, oppPlayer)){
        allReasonableMoves.push(move);
      }
    }
    return allReasonableMoves.length > 0 ? determineBasicAiMove(allReasonableMoves, currPlayer, board):
     determineBasicAiMove(allPossibleMoves, currPlayer, board);
  }
  let [y, x] = determineAiMove();
  board[y][x] = currPlayer;
  placeInTable(y, x);
  if (checkForWin(board, currPlayer)) {
    return endGame('You lost to the AI!');
  }

  if (board.every(row => row.every(val => val > 0))) {
    endGame('You Tied!');
  }

  currPlayer = 1;
}

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

buttons.addEventListener('click', (e) => {
  if (e.target.id === 'ai'){
    initGame(true);
  }
  else if (e.target.id === 'vs'){
    initGame(false);
  }
});

function initGame(isAI) {
  board = makeBoard();
  makeHtmlBoard();
  buttons.className = 'hidden';
  currPlayer = 1;
  AiActive = isAI;
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

function findSpotForCol(x, board) {
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
  currPlayer = 0;
  const resetBtn = document.createElement('button');
  resetBtn.id = 'reset';
  resetBtn.innerText = 'Reset the Game';
  resetBtn.addEventListener('click', resetGame);
  document.querySelector('body').append(resetBtn);
}

function resetGame(e) {
  e.target.remove();
  document.querySelector('#board').innerHTML = '';
  buttons.className = '';
}

function handleClick(evt) {
  if (currPlayer && (!AiActive || currPlayer === 1)) {
    let x = +evt.target.id;
    let y = findSpotForCol(x, board);
    if (y === null) {
      return;
    }

    board[y][x] = currPlayer;
    placeInTable(y, x);

    if (checkForWin(board, currPlayer)) {
      return endGame(`Player ${currPlayer} won!`);
    }

    if (board.every(row => row.every(val => val > 0))) {
      endGame('You Tied!');
    }

    currPlayer = currPlayer === 1 ? 2 : 1;
    if (AiActive) {
      makeAiMove();
    }
  }
}

function checkForWin(board, player) {
  function _win(cells) {
    return cells.every(
      ([y, x]) =>
        y >= 0 &&
        y < HEIGHT &&
        x >= 0 &&
        x < WIDTH &&
        board[y][x] === player
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