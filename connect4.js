class Game {
  constructor(id = 'First', WIDTH = 7, HEIGHT = 6) {
    this.WIDTH = WIDTH;
    this.HEIGHT = HEIGHT;
    this.currPlayer = 0;
    this.board = [];
    this.buttons = this.createStartButtons();
    this.htmlBoard = document.createElement('table');
    this.htmlBoard.id = id;
    this.id = id;
    this.htmlBoard.className = 'board';
    this.player1 = {};
    this.player2 = {};
  }
  createStartButtons() {
    const buttons = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.innerText = 'Select Your Mode';
    buttons.append(legend)
    const vsBtn = document.createElement('button');
    vsBtn.id = 'vs';
    vsBtn.innerText = 'vs Human';
    const aiBtn = document.createElement('button');
    aiBtn.id = 'ai';
    aiBtn.innerText = 'vs AI';
    buttons.append(vsBtn)
    buttons.append(aiBtn);
    document.body.append(buttons);
    buttons.addEventListener('click', (e) => {
      //checks that a button has been clicked on
      if (e.target.type === 'submit') {
        this.initGame(e.target.id === 'ai'); //initilizes the game either with an AI or without one
      }
    });
    return buttons;
  }
  //takes a boolean to determine whether ai should be active
  initGame(isAI) {
    this.makeBoard(); //initilizes board variable/resets it for a new game
    this.makeHtmlBoard();//creates HTML table for game to be played on
    this.buttons.className = 'hidden';//hides the buttons so no new game can be started during an active game
    this.player1 = new Player(1, 'red', false, this);
    this.player2 = new Player(2, 'blue', isAI, this);
    this.currPlayer = this.player1; //sets the current turn to be player1
  }
  makeBoard() {
    this.board = [];
    for (let r = 0; r < this.HEIGHT; r++) {
      let row = [];
      for (let c = 0; c < this.WIDTH; c++) {
        row.push(0);
      }
      this.board.push(row);
    }
  }
  //fills the HTML gameboard where the game is displayed
  makeHtmlBoard() {
    const top = document.createElement("tr"); //the first row which is not a game cell but is where players click which row to drop to

    top.setAttribute("id", "column-top");
    top.addEventListener("click", this.handleClick.bind(this));

    for (let x = 0; x < this.WIDTH; x++) { //fills the top rows with cells
      const headCell = document.createElement("td");
      headCell.setAttribute("id", x); //the top rows id is its x coordinate on the table
      top.append(headCell);
    }
    this.htmlBoard.append(top);

    for (let y = 0; y < this.HEIGHT; y++) { //fills the table with rows
      const row = document.createElement("tr");
      for (let x = 0; x < this.WIDTH; x++) { //fills each row with game cells
        const cell = document.createElement("td");
        cell.setAttribute("data-id", `${y}-${x}`); //each cell has an id "y-x" to determine its coordinates
        row.append(cell);
      }
      this.htmlBoard.append(row);
    }
    document.querySelector('#game').append(this.htmlBoard);
  }
  //handleClick drops a piece based on which row they piece is dropped in
  handleClick(evt) {
    //clicks should only be handled if it is a human player's turn
    if (this.currPlayer && (!this.currPlayer.isAI)) {
      //the piece will be dropped to the table based on x, y coordinates
      let x = +evt.target.id; //x is based on the row being dropped in
      let y = this.findSpotForCol(x);//y is the lowest unoccupied space in that column
      if (y === null) {//if there is no space in that column, the click is an invalid move and is terminated
        return;
      }
      this.takeTurn(y, x);
    }
  }
  takeTurn(y, x) {
    this.board[y][x] = this.currPlayer.num; //this command updates the data structure responsible for tracking the game
    this.placeInTable(y, x); //this command updates the HTML structure that the players see

    if (this.checkForWin()) { //checks if the most recent move caused the game to end in a victory
      return this.endGame(`${this.currPlayer} won!`); //exiting the click and calling for the game to end if it did
    }

    if (this.board.every(row => row.every(cell => cell))) { //checks if everyspot of the map has been filled
      return this.endGame('You Tied!'); //exiting the click and calling for a tie if it did
    }

    this.currPlayer = this.currPlayer === this.player1 ? this.player2 : this.player1; //swaps the current player from 1 to 2 or vice versa
    if (this.currPlayer.isAI){
      this.takeTurn(...this.currPlayer.determineAiMove());
    }

  }
  //finds the lowest spot on a gameboard for a given x
  findSpotForCol(x, gameBoard = this.board) {
    for (let i = this.HEIGHT - 1; i >= 0; i--) { //goes through from the bottom to top to find the lowest spot
      if (gameBoard[i][x] === 0) {
        return i;
      }
    }
    return null; //returns null if there was no valid spot
  }
  //creates an html element to represent the piece and adds it to the correct cell
  placeInTable(y, x) {
    const newP = document.createElement('div');
    newP.classList.add('piece');
    newP.style ='background-color: ' + this.currPlayer.color;
    document.querySelector(`#${this.id} > tr > [data-id = '${y}-${x}']`).append(newP); //attaches the piece to the element with id 'y-x'
  }
  //return true if a player has achieved num in a row on a gameboard
  //by default checks on the current board for the current player and looks for 4 in a row
  checkForWin(gameBoard = this.board, player = this.currPlayer.num, num = 4) {
    //helper function, takes an array of [y, x] cells and returns true if every cell exists on the board and belongs to a player
    const _win = (cells) => {
      return cells.every(([y, x]) =>
        y >= 0 &&
        y < this.HEIGHT &&
        x >= 0 &&
        x < this.WIDTH &&
        gameBoard[y][x] === player
      );
    }

    //loops through every [y,x] cell on the gameboard and creates an array of cells in the 4 directions that can be won in
    for (let y = 0; y < this.HEIGHT; y++) {
      for (let x = 0; x < this.WIDTH; x++) {
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
  endGame(msg) {
    alert(msg); //displays the message and paused the webpage
    this.currPlayer = 0; //sets the game to inactive
    const resetBtn = document.createElement('button'); //creates a button to reset the game
    resetBtn.innerText = 'Reset the Game';
    resetBtn.addEventListener('click', this.resetGame.bind(this));
    document.querySelector('body').append(resetBtn);
  }
  resetGame(e) {
    e.target.remove(); //remove the reset button
    this.htmlBoard.innerHTML = ''; //wipe the table
    this.buttons.className = ''; //unhide the initialize game buttons
  }
}

const connectFour = new Game();

class Player {
  constructor(num, color, isAI, game) {
    this.num = num;
    this.color = color;
    this.isAI = isAI;
    this.game = game;
  }
  toString(){
    return this.isAI ? 'The AI': `Player ${this.num}`;
  }
  //determineAiMove creates a 2 element array [y, x] called a move
  //it relies heavily on helper function determineBasicAiMove which determines a move but does not look ahead at future turns
  determineAiMove() {
    const oppPlayer = this.num === 1 ? 2 : 1; //since the AI is always player2, oppPlayer is player1
    const allPossibleMoves = this.determineAllPossibleMoves(this.game.board); //creates an array of all possible moves
    //this section checks if the AI has a move to win on the spot, it will take that move if such a move exists
    const winningMove = this.checkForWinningMoves(allPossibleMoves);
    if (winningMove.length > 0) {
      return winningMove[0];
    }
    //it will then attempt to create a list of 'reasonable' moves filtered from all moves
    //a move is reasonable if the opponent will not be able to win off the back of it
    let allReasonableMoves = this.determineReasonableMoves(allPossibleMoves, oppPlayer);
    //if there are reasonable moves, it should take one
    if (allReasonableMoves.length > 0) {
      return this.determineBasicAiMove(allReasonableMoves, this.num, this.game.board)
    }
    //otherwise, take the best move of its options
    return this.determineBasicAiMove(allPossibleMoves, this.num, this.game.board);
  }
  //this function returns an array of 'moves' for every move currently possible
  determineAllPossibleMoves(board) {
    let tempArr = [];
    //it checks all columns to see if there is a move possible in that column
    for (let i = 0; i < this.game.WIDTH; i++) {
      if (typeof this.game.findSpotForCol(i, board) === 'number') {
        tempArr.push([this.game.findSpotForCol(i, board), i])
      }
    }
    return tempArr;
  }
  //given a list of moves, returns which of those moves when taken on an imaginary board, would result in a game win
  //takes the same paramaters as checkForWin and uses the same assumptions
  checkForWinningMoves(moves, player = this.num, gameBoard = this.game.board, num = 4) {
    return moves.filter((move) => {
      const tempBoard = structuredClone(gameBoard);
      let [y, x] = move;
      tempBoard[y][x] = player;
      return this.game.checkForWin(tempBoard, player, num);
    });
  }
  determineReasonableMoves(moves, oppPlayer){
    return moves.filter((move) => {
      const tempBoard = structuredClone(this.game.board); //it creates an imaginary game state
      let [y, x] = move;
      tempBoard[y][x] = this.num; //it updates the imaginary game state after this move
      const oppNextMoves = this.determineAllPossibleMoves(tempBoard); //it determines what move its opponent could take next
      return this.checkForWinningMoves(oppNextMoves, oppPlayer, tempBoard).length === 0; //and returns if the opponent can't win off it
    });
  }
  //determines which move the ai should make but cannot look ahead
  //accepts a list of moves it can make, which player it is and which board it is playing on
  determineBasicAiMove(moves, player, board) {
    const oppPlayer = player === 1 ? 2 : 1; //declares an opponent to be player1 or 2 opposite of itself

    //loops backwards through its 'priorities'
    //a priority is the number in a row that can be achieved on a given move
    //it prioritizes lines with length 4 > 3 > 2
    //it prioritizes its own line over spoiling its opponent if both are within the same size bracket
    for (let i = 4; i >= 2; i--) {
      let winningMoves = this.checkForWinningMoves(moves, player, board, i)
      if (winningMoves.length > 0) {
        return randomElement(winningMoves); //it generates a random move that is available within this priority.
      }
      let oppWinningMoves = this.checkForWinningMoves(moves, oppPlayer, board, i);
      if (oppWinningMoves.length > 0) {
        return randomElement(oppWinningMoves);
      }
    }
    return randomElement(moves); //if no moves have any priority it will do a random move
  }
}

//returns a random element from an array
function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}