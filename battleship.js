let options = {
  boardWidth: 500,
  boardHeight: 500
}

class Ship {
  constructor(name, length) {
    this.name = name;
    this.length = length;
    this.hits = [];
    this.isOperational = true;
    for(let j = 0; j < length; j++){
      this.hits.push(0);
    }
  }

  checkIfSunk(){
    var isSunk = this.hits.reduce((a, b) => !a && b === 0);
    if(isSunk){
      this.isOperational = false;
    }
  }
};

class Player {
  constructor(num){
    this.playerId = num;
    this.ships = this.initShips();
  }

  initShips(){
    let ships = {}
    for(let i = 1; i < 3; i++){
      ships.carrier = new Ship("Carrier", 5);
      ships.battleship = new Ship("Battleship", 4);
      ships.cruiser = new Ship("Cruiser", 3);
      ships.submarine = new Ship("Submarine", 3);
      ships.destroyer = new Ship("Destroyer", 2);
    }
    return ships;
  }
};

class Game {
  constructor(){
    this.currentPlayerId = 1;
    this.board = this.initBoard();
    this.players = this.initPlayers();
  }

  initBoard(){
    let outArr = [];
    for(let i = 0; i < 10; i++){
      let row = [];
      for(let j = 0; j < 10; j++){
        row.push([])
      }
      outArr.push(row);
    }
    return outArr;
  }

  initPlayers(){
    let players = {}
    for(let i = 1; i < 3; i++){
      let curPlayer = new Player(i);
      players[`p${i}`] = curPlayer;
    }
    return players;
  }
};

let createSquare = (parentRow, xVal, yVal) => {
  let square = $("<div/>").addClass("board-square");
  let squareWidth = options.boardWidth / 10;
  square.css("width", squareWidth);
  square.attr("id", `square-${xVal}-${yVal}`);
  square.attr("xVal", xVal);
  square.attr("yVal", yVal);
  parentRow.append(square);
}

let createBoard = (boardWidth, boardHeight) => {
  let container = $("#game-container");

  for(let i = 0; i < 10; i++){
    let row = $("<div/>").addClass("board-row");
    row.css("width", boardWidth);
    row.css("height", boardHeight / 10);
    row.attr("id", "row-" + i);
    row.attr("yVal", i);
    for(let j = 0; j < 10; j++){
      createSquare(row, j, i);
    }
    container.append(row);
  }
};

createBoard(options.boardWidth, options.boardHeight);

/*
  We have a 10 x 10 board array:
    -each square on the board is either going to contain:
      -null if it's empty
    -an object if it's occupied
      -object:
        object.playerNum
        object.name ie cruiser
        object.index ie 3rd position
        -hit info is going to be store in a separate ships object, along with the ship name, maybe an image,

*/

var curGame = new Game();
