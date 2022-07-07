const buttons = document.querySelector('fieldset');

const WIDTH = 7;
const HEIGHT = 6;

let currPlayer = 0;
let board = [];
let AiActive = false;

buttons.addEventListener('click', (e) => {
  if (e.target.id === 'ai') {
    initGame(true);
  }
  else if (e.target.id === 'vs') {
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

function handleClick(evt) {
  if (currPlayer && (!AiActive || currPlayer === 1)) {
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
    if (AiActive) {
      setTimeout(makeAiMove, 500);
    }
  }
}

function findSpotForCol(x, gameBoard) {
  if (!gameBoard) {
    gameBoard = board;
  }
  for (let i = HEIGHT - 1; i >= 0; i--) {
    if (gameBoard[i][x] === 0) {
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

function checkForWin(gameBoard, player) {
  if (!player) {
    player = currPlayer;
  }
  if (!gameBoard){
    gameBoard = board;
  }
  function _win(cells) {
    return cells.every(
      ([y, x]) =>
        y >= 0 &&
        y < HEIGHT &&
        x >= 0 &&
        x < WIDTH &&
        gameBoard[y][x] === player
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

function endGame(msg) {
  alert(msg);
  currPlayer = 0;
  const resetBtn = document.createElement('button');
  resetBtn.id = 'reset';
  resetBtn.innerText = 'Reset the Game';
  resetBtn.addEventListener('click', (e) => {
    e.target.remove();
    document.querySelector('#board').innerHTML = '';
    buttons.className = '';
  });
  document.querySelector('body').append(resetBtn);
}

function makeAiMove() {
  let [y, x] = determineAiMove();
  board[y][x] = currPlayer;
  placeInTable(y, x);
  if (checkForWin()) {
    return endGame('You lost to the AI!');
  }

  if (board.every(row => row.every(val => val > 0))) {
    endGame('You Tied!');
  }

  currPlayer = 1;
}

function determineAiMove() {
  const oppPlayer = 1;
  const allPossibleMoves = determineAllPossibleMoves(board);
  if (checkForWinningMove(allPossibleMoves, currPlayer, board)){
    return checkForWinningMove(allPossibleMoves, currPlayer, board)
  }
  let allReasonableMoves = [];
  for (let move of allPossibleMoves) {
    const tempBoard = structuredClone(board);
    let [y, x] = move;
    tempBoard[y][x] = currPlayer;
    const oppNextMoves = determineAllPossibleMoves(tempBoard);
    if (oppNextMoves.length > 0) {
      const oppNextMove = determineBasicAiMove(oppNextMoves, oppPlayer, tempBoard);
      [y, x] = oppNextMove;
      tempBoard[y][x] = oppPlayer;
      if (!checkForWin(tempBoard, oppPlayer)) {
        allReasonableMoves.push(move);
      }
    }
  }
  if (allReasonableMoves.length > 0) {
    return determineBasicAiMove(allReasonableMoves, currPlayer, board)
  }
  return determineBasicAiMove(allPossibleMoves, currPlayer, board);
}

function determineAllPossibleMoves(board) {
  let tempArr = [];
  for (let i = 0; i < WIDTH; i++) {
    if (typeof findSpotForCol(i, board) === 'number') {
      tempArr.push([findSpotForCol(i, board), i])
    }
  }
  return tempArr;
}

function checkForWinningMove(moves, player, board){
  for (let move of moves) {
    const tempBoard = structuredClone(board);
    let [y, x] = move;
    tempBoard[y][x] = player;
    if (checkForWin(tempBoard, player)) {
      return move;
    }
  }
}

function determineBasicAiMove(moves, player, board) {
  const oppPlayer = player === 1 ? 2 : 1;
  if (checkForWinningMove(moves, player, board)){
    return checkForWinningMove(moves, player, board);
  }
  if (checkForWinningMove(moves, oppPlayer, board)){
    return checkForWinningMove(moves, oppPlayer, board);
  }
  const idealMoves = [[HEIGHT-1,(WIDTH-1)/2],[HEIGHT-1, (WIDTH-1)/2-1],[HEIGHT-1,(WIDTH-1)/2+1]];
  for (let move of moves){
    for (let iMove of idealMoves){
      if (JSON.stringify(move) === JSON.stringify(iMove)){
        return move;
      }
    }
  }
  return moves[Math.floor(Math.random() * moves.length)];
}