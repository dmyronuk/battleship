
//both args are jquery objects - both column letter and row number are parsed as integers
let getCoordsFromSquare = (squareObj, shipObj) => {
  let coordsStr = squareObj.attr("id").split("-")[1];
  let rowInt = coordsStr.slice(0, 1).charCodeAt();
  let colInt = parseInt(coordsStr.slice(1));
  return {row: rowInt, col: colInt};
}

let getShipCoordsFromSquare = (squareObj, shipObj) => {
  let startCoords = getCoordsFromSquare(squareObj, shipObj);
  let orientation = shipObj.attr("orientation");
  let outCoords = [];
  //vertical placement
  if(shipObj.attr("orientation") == 0){
    for(let i = 0; i < shipObj.attr("length"); i++){
      let curRowStr = String.fromCharCode(startCoords.row + i)
      outCoords.push(curRowStr + startCoords.col);
    }
  //horizontal placement
  }else{
    let rowStr = String.fromCharCode(startCoords.row);
    for(let i = 0; i < shipObj.attr("length"); i++){
      let curColInt = startCoords.col + i;
      outCoords.push(rowStr + curColInt);
    }
  }
  return outCoords;
}

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
  square.attr("owner", ownerStr);
  square.attr("id", `${ownerStr}-${rowChar}${colNum}`);
  //Need to pull the DOM element out of the jquery object
  square.on("click", squareClickHandler);
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

//B up the container where player can select and place your battleships
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
    let width = options.squareWidth - 7;
    curShip.height(length);
    curShip.width(width);
    curShip.attr("id", curShipObj.name.toLowerCase());
    curShip.attr("orientation", 0);
    curShip.attr("length", curShipObj.length);
    curShip.on("click", shipPlacementClickHandler);

    let maxRow = "J".charCodeAt() - curShipObj.length + 1;
    let maxCol = 10 - curShipObj.length + 1;
    curShip.attr("max-row", maxRow);
    curShip.attr("max-col", maxCol);

    container.text(curShipObj.name);
    container.prepend(curShip);
    $("#game-info-right").append(container);
  })
}

//wrapper that returns event handler mousemove when ship is being placed
let shipMouseMoveHandler = (event) => {
  event.data.ship.css("top", event.pageY - event.data.containerYOffset - event.data.squareYOffset);
  event.data.ship.css("left", event.pageX - event.data.containerXOffset - event.data.squareXOffset);
};

//wrapper that returns event handler for "r" keypress -- rotates ship
let shipRotateHandler = (event) => {
  let ship = event.data.ship;

  if(event.key === "r"){
    //swap height and width properties
    let width = ship.width();
    let height = ship.height();
    ship.width(height);
    ship.height(width);
    //update orientation variable
    let newOrientation = (ship.attr("orientation") + 1) % 2;
    ship.attr("orientation", newOrientation);
  }
}

//make sure ship isn't placed outside of board
let shipInValidPosition = (ship, square) => {
  let squareCoords = getCoordsFromSquare(square);
  let shipMaxColInt = parseInt(ship.attr("max-col"));
  let shipMaxRowInt = parseInt(ship.attr("max-row"));
  let orientation = ship.attr("orientation");

  if(orientation == 0){
    return squareCoords.row <= shipMaxRowInt;
  }else if(orientation == 1)
    return squareCoords.col <= shipMaxColInt;
}

let shipSetPlaceHandler = (event) => {
  let ship = event.data.ship
  //target is square when we successfully click on a board square but it could be any elem
  let target = $(event.target);

  //target is a board square that belongs to hero
  if(target.hasClass("board-square") && target.attr("owner") === "hero"){

    if(shipInValidPosition(ship, target)){
      let left;
      let top;
      //vertical placement
      if(ship.attr("orientation") == 0){
        left ="-1px"
        top = target.height() / 4 + "px";
      //horizontal placement
      }else{
        left = target.width() / 4 + "px";
        top = "2px"
      }

      target.append(ship);
      ship.css("position", "relative");
      ship.css("top", top );
      ship.css("left", left);
      $("#main-container-mid").off("mousemove", shipMouseMoveHandler);
      $(window).off("keypress", shipRotateHandler);
      $(window).off("click", shipSetPlaceHandler);
      ship.off("click", shipPlacementClickHandler);

      let shipCoords = getShipCoordsFromSquare(target, ship);
      let data = {
        name: ship.attr("id"),
        coords: shipCoords
      }
      let shipJSON = JSON.stringify(data);
      $.ajax({
        type: "POST",
        url: "/place-hero-ships",
        data: shipJSON,
        dataType: "json",
        contentType: "application/json",
      });
    }
  }
}

let shipPlacementClickHandler = (event) => {
  let ship = $(event.target);
  let container = $("#main-container-mid");
  let gameInfoRight = $("#game-info-right");
  //0 represents vertical, 1 represents horizontal

  ship.detach().appendTo(container);
  ship.css("position", "absolute")
  ship.css("pointer-events", "none");
  ship.css("top", event.pageY - container.offset().top - options.squareHeight / 2);
  ship.css("left", event.pageX - container.offset().left - options.squareWidth / 2);

  container.on("mousemove", {
    ship:ship,
    squareYOffset: options.squareHeight / 2,
    squareXOffset: options.squareWidth / 2,
    containerYOffset: container.offset().top,
    containerXOffset: container.offset().left,
    }, shipMouseMoveHandler
  )
  $(window).on("keypress", {ship:ship}, shipRotateHandler);
  $(window).on("click", {ship:ship}, shipSetPlaceHandler);

}

let squareClickHandler = (event) => {
  console.log(event.target.id);
}
