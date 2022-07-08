const buttons = document.querySelector('fieldset'); //this is the html element that contains the start buttons

//width and height of the game board
const WIDTH = 7;
const HEIGHT = 6;

let currPlayer = 0; //the player whose turn it is, 0 = inactive game, 1 = player1, 2 = player2/AI

//board stores the game's data, which pieces have been played, it is separate from the HTML board
//updating one will not update the other
let board = [];

let aiActive = false; //boolean that determines whether there is an AI or human player2


//detects a click on the fieldset where the start buttons are
buttons.addEventListener('click', (e) => {
  //checks that a button has been clicked on
  if (e.target.type === 'submit') {
    initGame(e.target.id === 'ai'); //initilizes the game either with an AI or without one
  }
});

//takes a boolean to determine whether ai should be active
function initGame(isAI) {
  makeBoard(); //initilizes board variable/resets it for a new game
  makeHtmlBoard();//creates HTML table for game to be played on
  buttons.className = 'hidden';//hides the buttons so no new game can be started during an active game
  currPlayer = 1; //sets the current turn to be player1
  aiActive = isAI;
}

//sets board equal to a HEIGHT x WIDTH 2d array filled with 0s. 
function makeBoard() {
  board = [];
  for (let r = 0; r < HEIGHT; r++) {
    let row = [];
    for (let c = 0; c < WIDTH; c++) {
      row.push(0);
    }
    board.push(row);
  }
}

//fills the HTML gameboard where the game is displayed
function makeHtmlBoard() {
  const htmlBoard = document.querySelector('#board') //the board where everything will be appended to
  const top = document.createElement("tr"); //the first row which is not a game cell but is where players click which row to drop to

  top.setAttribute("id", "column-top");
  top.addEventListener("click", handleClick);

  for (let x = 0; x < WIDTH; x++) { //fills the top rows with cells
    const headCell = document.createElement("td");
    headCell.setAttribute("id", x); //the top rows id is its x coordinate on the table
    top.append(headCell);
  }
  htmlBoard.append(top);

  for (let y = 0; y < HEIGHT; y++) { //fills the table with rows
    const row = document.createElement("tr");
    for (let x = 0; x < WIDTH; x++) { //fills each row with game cells
      const cell = document.createElement("td");
      cell.setAttribute("id", `${y}-${x}`); //each cell has an id "y-x" to determine its coordinates
      row.append(cell);
    }
    htmlBoard.append(row);
  }
}

//handleClick drops a piece based on which row they piece is dropped in
function handleClick(evt) {
  //clicks should only be handled if it is a human player's turn
  if (currPlayer && (!aiActive || currPlayer === 1)) {
    //the piece will be dropped to the table based on x, y coordinates
    let x = +evt.target.id; //x is based on the row being dropped in
    let y = findSpotForCol(x);//y is the lowest unoccupied space in that column
    if (y === null) {//if there is no space in that column, the click is an invalid move and is terminated
      return;
    }

    board[y][x] = currPlayer; //this command updates the data structure responsible for tracking the game
    placeInTable(y, x); //this command updates the HTML structure that the players see

    if (checkForWin()) { //checks if the most recent move caused the game to end in a victory
      return endGame(`Player ${currPlayer} won!`); //exiting the click and calling for the game to end if it did
    }

    if (board.every(row => row.every(cell => cell))) { //checks if everyspot of the map has been filled
      return endGame('You Tied!'); //exiting the click and calling for a tie if it did
    }

    currPlayer = currPlayer === 1 ? 2 : 1; //swaps the current player from 1 to 2 or vice versa
    if (aiActive) { //if the ai is active, have it take its turn
      setTimeout(makeAiMove, 500); //the ai waits half a second so that its turn appears separate from the prior turn
    }
  }
}

//finds the lowest spot on a gameboard for a given x
//typically the gameboard is the board the current game is being played on
function findSpotForCol(x, gameBoard = board) {
  for (let i = HEIGHT - 1; i >= 0; i--) { //goes through from the bottom to top to find the lowest spot
    if (gameBoard[i][x] === 0) {
      return i;
    }
  }
  return null; //returns null if there was no valid spot
}

//creates an html element to represent the piece and adds it to the correct cell
function placeInTable(y, x) {
  const newP = document.createElement('div');
  newP.classList.add('piece');
  newP.classList.add(currPlayer === 1 ? 'p1' : 'p2'); //this class gives the piece the proper color
  document.getElementById(y + '-' + x).append(newP); //attaches the piece to the element with id 'y-x'
}

//return true if a player has achieved num in a row on a gameboard
//by default checks on the current board for the current player and looks for 4 in a row
function checkForWin(gameBoard = board, player = currPlayer, num = 4) {
  //helper function, takes an array of [y, x] cells and returns true if every cell exists on the board and belongs to a player
  function _win(cells) {
    return cells.every(([y, x]) =>
      y >= 0 &&
      y < HEIGHT &&
      x >= 0 &&
      x < WIDTH &&
      gameBoard[y][x] === player
    );
  }

  //loops through every [y,x] cell on the gameboard and creates an array of cells in the 4 directions that can be won in
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
      const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
      const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
      const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

      //if any of these arrays of cells return a win then return true
      //these arrays are sliced by the number in a row to look for
      if (_win(horiz.slice(0, num)) || _win(vert.slice(0, num)) || _win(diagDR.slice(0, num)) || _win(diagDL.slice(0, num))) {
        return true;
      }
    }
  }
}

//ends the game while displaying a message
function endGame(msg) {
  alert(msg); //displays the message and paused the webpage
  currPlayer = 0; //sets the game to inactive
  const resetBtn = document.createElement('button'); //creates a button to reset the game
  resetBtn.innerText = 'Reset the Game';
  resetBtn.addEventListener('click', (e) => { //when the button is clicked
    e.target.remove(); //remove the reset button
    document.querySelector('#board').innerHTML = ''; //wipe the table
    buttons.className = ''; //unhide the initialize game buttons
  });
  document.querySelector('body').append(resetBtn);
}

//this function makes the AI move on the gameboard and passes the turn back
//it mimicks handleClick and is very similar
//instead of taking coordinates from a DOM event it uses a helper function determineAiMove to figure out where it should move
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


//determineAiMove creates a 2 element array [y, x] called a move
//it relies heavily on helper function determineBasicAiMove which determines a move but does not look ahead at future turns
function determineAiMove() {
  const oppPlayer = 1; //since the AI is always player2, oppPlayer is player1
  const allPossibleMoves = determineAllPossibleMoves(board); //creates an array of all possible moves

  //this section checks if the AI has a move to win on the spot, it will take that move if such a move exists
  const winningMove = checkForWinningMoves(allPossibleMoves);
  if (winningMove.length > 0) {
    return winningMove[0];
  }

  //it will then attempt to create a list of 'reasonable' moves filtered from all moves
  //a move is reasonable if the opponent will not be able to win off the back of it
  let allReasonableMoves = allPossibleMoves.filter((move) => {
    const tempBoard = structuredClone(board); //it creates an imaginary game state
    let [y, x] = move;
    tempBoard[y][x] = currPlayer; //it updates the imaginary game state after this move
    const oppNextMoves = determineAllPossibleMoves(tempBoard); //it determines what move its opponent could take next
    return checkForWinningMoves(oppNextMoves, oppPlayer, tempBoard).length === 0; //and returns if the opponent can't win off it
  });

  //if there are reasonable moves, it should take one
  if (allReasonableMoves.length > 0) {
    return determineBasicAiMove(allReasonableMoves, currPlayer, board)
  }
  //otherwise, take the best move of its options
  return determineBasicAiMove(allPossibleMoves, currPlayer, board);
}

//this function returns an array of 'moves' for every move currently possible
function determineAllPossibleMoves(board) {
  let tempArr = [];
  //it checks all columns to see if there is a move possible in that column
  for (let i = 0; i < WIDTH; i++) {
    if (typeof findSpotForCol(i, board) === 'number') {
      tempArr.push([findSpotForCol(i, board), i])
    }
  }
  return tempArr;
}

//given a list of moves, returns which of those moves when taken on an imaginary board, would result in a game win
//takes the same paramaters as checkForWin and uses the same assumptions
function checkForWinningMoves(moves, player = currPlayer, gameBoard = board, num = 4) {
  return moves.filter((move) => {
    const tempBoard = structuredClone(gameBoard);
    let [y, x] = move;
    tempBoard[y][x] = player;
    return checkForWin(tempBoard, player, num);
  });
}

//determines which move the ai should make but cannot look ahead
//accepts a list of moves it can make, which player it is and which board it is playing on
function determineBasicAiMove(moves, player, board) {
  const oppPlayer = player === 1 ? 2 : 1; //declares an opponent to be player1 or 2 opposite of itself

  //loops backwards through its 'priorities'
  // a priority is the number in a row that can be achieved on a given move
  //it prioritizes lines with length 4 > 3 > 2
  //it prioritizes its own line over spoiling its opponent if both are within the same size bracket
  for (let i = 4; i >= 2; i--) {
    let winningMoves = checkForWinningMoves(moves, player, board, i)
    if (winningMoves.length > 0) {
      return randomElement(winningMoves); //it generates a random move that is available within this priority.
    }
    let oppWinningMoves = checkForWinningMoves(moves, oppPlayer, board, i);
    if (oppWinningMoves.length > 0) {
      return randomElement(oppWinningMoves);
    }
  }
  return randomElement(moves); //if no moves have any priority it will do a random move
}

//returns a random element from an array
function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}