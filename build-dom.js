let calculateSquareColor = (rowChar, colNum) => {
  rowNum = rowChar.charCodeAt();
  let remainder = (rowNum % 2 === 0) ? 1 : 0;
  let color = (colNum % 2 === remainder) ? options.squareColorA : options.squareColorB;
  return color;
}

let createSquare = (parentRow, ownerStr, rowChar, colNum) => {
  let square = $("<div/>").addClass("board-square");
  let squareColor = calculateSquareColor(rowChar, colNum);
  square.css("background-color", squareColor);
  square.css("width", options.squareWidth);
  square.css("height", options.squareHeight);
  square.attr("id", `${ownerStr}-${rowChar}${colNum}`);
  //Need to pull the DOM element out of the jquery object
  square[0].addEventListener("click", squareClickHandler);
  parentRow.append(square);
}

let createRowLabel = (board, rowChar) => {
  let rowLabelContainer = board.siblings(".row-label-container");
  let rowLabel = $("<div/>").addClass("row-label");
  rowLabel.css("height", options.squareHeight);
  rowLabel.css("top", options.squareHeight * -3 / 10)
  rowLabel.text(rowChar)
  rowLabelContainer.append(rowLabel);
}

let createColumnLabels = (board) => {
  let rowA = $(board).find("#row-A");
  let rowWidth = rowA.width();
  let squareWidth = rowWidth / 10;
  let squareHeight = squareWidth;
  let columnLabelContainer = $("<div/>");
  columnLabelContainer.width(rowWidth);

  //Add column labels
  for(let i = 0; i < 10; i ++){
    let columnLabel = $("<div/>").addClass("column-label");
    columnLabel.text(i+1);
    columnLabel.width(squareWidth);
    columnLabelContainer.append(columnLabel);
  }
  $(board).prepend(columnLabelContainer);
};

let createBoards = (options, elems) => {
  for(elem of elems){
    let ownerStr = $("#" + elem).attr("owner");
    let board = $("#" + elem).find(".board");

    //rows
    for(let i = 0; i < 10; i++){
      let row = $("<div/>").addClass("board-row");
      let rowChar = String.fromCharCode(i + 65);

      //create row label
      createRowLabel(board, rowChar);

      //each row entry
      for(let j = 1; j < 11; j++){
        createSquare(row, ownerStr, rowChar, j);
      }
      row.css("width", options.boardWidth);
      row.attr("id", "row-" + rowChar);
      row.height(options.squareHeight);
      board.append(row);
    }
    createColumnLabels(board);
  }
};

let displayShipPlacementInfo = (ships, options) => {
    //hero is the player whose game state is being rendered by current browser
    let gameInfoHeading = $("#game-info-heading");
    gameInfoHeading.text("Place Your Battleships");

    let gameInfoText = $("#game-info-text");
    gameInfoText.text("Press 'R' to rotate");

    Object.keys(ships).forEach((shipKey) => {
      let curShip = $("<div/>").addClass("ship");
      let container = $("<div/>").addClass("ship-selection-container")

      let curShipObj = ships[shipKey];
      let length = curShipObj.length * options.squareHeight - 20;
      let width = options.squareWidth - 4;
      curShip.height(length);
      curShip.width(width);
      curShip.attr("id", "hero-" + curShipObj.name.toLowerCase());
      container.text(curShipObj.name)

      container.prepend(curShip);
      $("#game-info-right").append(container);
    })
  }

let shipPlacementClickHandler = (event) => {
  console.log(event.target);
}

let squareClickHandler = (event) => {
  console.log(event.target.id);
}
