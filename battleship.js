let options = {
  boardWidth: 500,
  boardHeight: 500
}

class Ship {
  constructor(name, length) {
    this.name = name;
    this.length = length;
    this.hits = [];
    for(let i = 0; i < length; i++){
      hits.push(0);
    }
  }
};

class Player {
  constructor(id){
    this.id = id;
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
    let players = []
    for(let i = 1; i < 3; i++){
      let curPlayer = new Player(i);
      players.push(curPlayer);
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

let createBoardRow = (boardWidth, boardHeight) => {
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

createBoardRow(options.boardWidth, options.boardHeight);

var curGame = new Game()