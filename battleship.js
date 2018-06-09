let options = {
  boardWidth: 400,
  boardHeight: 400
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

let calculateSquareColor = (rowNum, colNum) => {
  let remainder = (rowNum % 2 === 0) ? 1 : 0;
  let color = (colNum % 2 === remainder) ? "blue" : "#e5e5ff";
  return color;
}

let createSquare = (parentRow, ownerStr, squareColor, rowChar, j) => {
  let square = $("<div/>").addClass("board-square");
  let squareWidth = options.boardWidth / 10;
  square.css("background-color", squareColor);
  square.css("width", squareWidth);
  square.attr("id", `${ownerStr}-${rowChar}${j}`);
  //Need to pull the DOM element out of the jquery object
  square[0].addEventListener("click", squareClickHandler);
  parentRow.append(square);
}

let createBoards = (options, elems) => {
  for(elem of elems){
    let container = $("#" + elem);
    let ownerStr = container.attr("owner");

    //rows
    for(let i = 0; i < 10; i++){
      var rowChar = String.fromCharCode(i + 65);
      let row = $("<div/>").addClass("board-row");
      row.css("width", options.boardWidth);
      row.css("height", options.boardHeight / 10);
      row.attr("id", "row-" + rowChar);

      //each row entry
      for(let j = 1; j < 11; j++){
        let squareColor = calculateSquareColor(i, j);
        createSquare(row, ownerStr, squareColor, rowChar, j);
      }
      container.append(row);
    }
  }
};

let squareClickHandler = (event) => {
  console.log(event.target.id);
}

let labelBoards = () => {
  let boards = Array.from($(".game-container"));
  boards.forEach((board) => {
    let rowA = $(board).find("#row-A");
    let rowWidth = rowA.width();
    let squareWidth = rowWidth / 10;
    let squareHeight = squareWidth;
    let columnLabelContainer = $("<div/>");
    columnLabelContainer.width(rowWidth);

    //Add column labels
    for(let i = 0; i < 10; i ++){
      var columnLabel = $("<div/>").addClass("column-label");
      columnLabel.text(i+1);
      columnLabel.width(squareWidth);
      columnLabelContainer.append(columnLabel);
    }
    $(board).prepend(columnLabelContainer);

    var rows = Array.from($(board).children(".board-row"));
    for(let j = 0; j < 10; j++){
      var curChar = String.fromCharCode(j + 65);
      var rowLabel = $("<div/>").addClass("row-label");
      rowLabel.text(curChar);
      $(rows[j]).prepend(rowLabel)
    }
  })
}

createBoards(options, ["hero-board-container", "opponent-board-container"]);
labelBoards();
var curGame = new Game();

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


