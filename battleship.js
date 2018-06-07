let options = {
  boardWidth: 500,
  boardHeight: 500
}

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