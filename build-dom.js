let options = {
  squareWidth: 35,
  squareHeight: 35,
  squareColorA: "blue",
  squareColorB: "#e5e5ff",
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
      curShip.on("click", shipPlacementClickHandler);

      container.text(curShipObj.name)
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

let shipSetPlaceHandler = (event) => {
  let ship = event.data.ship
  //target is square when we successfully click on a board square but it could be any elem
  let target = $(event.target);

  if(target.hasClass("board-square") && target.attr("owner") === "hero"){
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

let test = () => {
  console.log(...arguments)
}