let options = {
  squareWidth: 35,
  squareHeight: 35,
  squareColorA: "blue",
  squareColorB: "#e5e5ff",
  turnWaitTime:3000,
}

let occupiedSquares = {
  hero:[],
  opponent:[],
};

//both args are jquery objects - both column letter and row number are parsed as integers
let getCoordsFromSquare = (squareObj) => {
  let coordsStr = squareObj.attr("id").split("-")[1];
  let rowInt = coordsStr.slice(0, 1).charCodeAt();
  let colInt = parseInt(coordsStr.slice(1));
  return {row: rowInt, col: colInt};
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
  parentRow.append(square);
}

let createRowLabel = (board, rowChar) => {
  let rowLabelContainer = board.siblings(".row-label-container");
  let rowLabel = $("<div/>").addClass("row-label");
  rowLabel.css("height", options.squareHeight);
  rowLabel.css("top", options.squareHeight * -3 / 10);
  rowLabel.text(rowChar);
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

createScoreboardTable = (playerName, isHero) => {
  let tableClass = isHero ? "hero-table" : "opponent-table";
  return $(
  `<div>
    <div class="scoreboard-name">${playerName}</div>
    <table class="scoreboard-table ${tableClass}">
      <tr>
        <td>Carrier:</td>
        <td class="operational-td carrier-state">Operational</td>
      </tr>
      <tr>
        <td>Battleship:</td>
        <td class="operational-td battleship-state">Operational</td>
      </tr>
      <tr>
        <td>Cruiser:</td>
        <td class="operational-td cruiser-state">Operational</td>
      </tr>
      <tr>
        <td>Submarine:</td>
        <td class="operational-td submarine-state">Operational</td>
      </tr>
      <tr>
        <td>Destroyer:</td>
        <td class="operational-td destroyer-state">Operational</td>
      </tr>
    </table>
  </div>
`);
}

let createScoreBoard = () => {
  let container = $("#game-info-right");
  let userName = container.data("userName");
  let opponentName = container.data("opponentName");
  let wins = container.data("wins");
  let losses = container.data("losses");
  let $heading = $(`<div class="score-wins">Wins: ${wins} Losses: ${losses}</div>`);
  let $heroTable = createScoreboardTable(userName, true);
  let $opponentTable = createScoreboardTable(opponentName, false);
  container.append([$heading, $heroTable, $opponentTable]);
};

//dynamically build game boards for both players
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

//args: ship, owner, orientation, row, col
//row string should have been converted to its charCode integer
let getShipCoordsFromStartPos = (args) => {
  let outCoords = [];
  //vertical
  if(args.orientation == 0){
    for(let i = 0; i < args.length; i++){
      let curRow = String.fromCharCode(args.row + i);
      outCoords.push(curRow + args.col);
    }
  //horizontal placement
  }else{
    let rowStr = String.fromCharCode(args.row);
    for(let i = 0; i < args.length; i++){
      let curCol = args.col + i;
      outCoords.push(rowStr + curCol);
    }
  }
  return outCoords;
}

//args: ship, owner, orientation, row, col
//returns the ships coordinates
let shipInValidPosition = (args) => {
  let maxRow = "J".charCodeAt() - args.length + 1;
  let maxCol = 10 - args.length + 1;
  //vertically placed ship is outside of board

  if(args.orientation == 0 && args.row > maxRow){
    return null;
  //horizontally placed ship is outside of board
  } else if(args.orientation == 1 && args.col > maxCol){
    return null;
  }else{
    let shipCoords = getShipCoordsFromStartPos(args);
    //test if any squares are already occupied and returns null if yes
    return shipCoords.reduce((acc, cur) => {
      if(occupiedSquares[args.owner].indexOf(cur) >=0 ){
        acc = null;
      }
      return acc;
    }, shipCoords)
  }
};


let placeComputerShips = (shipsObj) => {
  let shipsKeys = Object.keys(shipsObj);
  let outCoords = [];

  shipsKeys.forEach(elem => {
    let curShipObj = shipsObj[elem];
    let iterationFinished = false;

    //try a random ship position
    while(! iterationFinished){
      let randRow = Math.floor(Math.random() * 10) + 65;
      let randCol = Math.ceil(Math.random() * 10);
      let randOrientation = Math.round(Math.random());

      let shipValidationArgs = {
        ship: curShipObj,
        length:curShipObj.length,
        owner: "opponent",
        orientation: randOrientation,
        row: randRow,
        col: randCol,
      }
      //checks if ship is in valid position and returns the ship's coordinates
      let shipCoords = shipInValidPosition(shipValidationArgs);

      if(shipCoords){
        iterationFinished = true;
        shipCoords.forEach(elem => {
          occupiedSquares.opponent.push(elem);
        })

        let shipName = curShipObj.name.toLowerCase();
        ajaxShipCoords(shipName, shipCoords, "opponent");
      }
    }
  })
};

//Create the container where player can select and place battleships
let displayShipPlacementInfo = (ships, options) => {
  //hero is the player whose game state is being rendered by current browser
  $("#game-info-heading").text("Place Your Battleships");
  $("#game-info-text").text("Press 'R' to rotate");
  $("#game-info-right").css("align-items", "flex-end");

  Object.keys(ships).forEach((shipKey) => {
    let curShipObj = ships[shipKey];
    let curShip = $(`
      <div class="ship">
      <div>
    `);
    let container = $("<div/>").addClass("ship-selection-container")
    let length = curShipObj.length * options.squareHeight - 7;
    let width = options.squareWidth - 7;
    curShip.height(length);
    curShip.width(width);
    curShip.attr("id", curShipObj.name.toLowerCase());
    curShip.attr("orientation", 0);
    curShip.attr("length", curShipObj.length);
    // curShip.css("background-image", `url('${curShipObj.imageURL}')`)
    curShip.on("click", shipPlacementClickHandler);
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
    const prevOrientation = parseInt(ship.attr("orientation"));
    const newOrientation = (prevOrientation + 1) % 2;
    ship.attr("orientation", newOrientation);
  }
}
//Since the AI's random ship placement is done on the client side, we need to send the coords back to the server
let ajaxShipCoords = (shipName, shipCoords, owner) => {
  let data = {
    name: shipName,
    coords: shipCoords,
    playerName: owner,
  }

  let shipJSON = JSON.stringify(data);
  $.ajax({
    type: "POST",
    url: "/place-ships",
    data: shipJSON,
    dataType: "json",
    contentType: "application/json",
    success: function(data){
      if(owner === "hero"){
        let allShipsPlaced = JSON.parse(data);
        if(allShipsPlaced){
          placementFinishedHandler();
        }
      }
    }
  })
}

let shipSetPlaceHandler = (event) => {
  let ship = event.data.ship
  //target is square when we successfully click on a board square but it could be any elem
  let target = $(event.target);

  //target is a board square that belongs to hero
  if(target.hasClass("board-square") && target.attr("owner") === "hero"){
    let squareCoords = getCoordsFromSquare(target);
    let shipValidationArgs = {
      ship: ship,
      length: parseInt(ship.attr("length")),
      owner: "hero",
      orientation: ship.attr("orientation"),
      row: squareCoords.row,
      col: squareCoords.col,
    }
    //validation needs to generate a list of ship coords so the validator function returns these coords || null
    let shipCoords = shipInValidPosition(shipValidationArgs);
    if(shipCoords){
      let left;
      let top;
      //vertical placement adjusstment
      if(ship.attr("orientation") == 0){
        left ="-1px";
        top = target.height() / 8 - 2 + "px";
      //horizontal placement adjustment
      }else{
        left = target.width() / 8 - 2 + "px";
        top = "2px";
      }

      target.append(ship);
      ship.css("position", "relative");
      ship.css("top", top );
      ship.css("left", left);
      $("#main-container-mid").off("mousemove", shipMouseMoveHandler);
      $(window).off("keypress", shipRotateHandler);
      $(window).off("click", shipSetPlaceHandler);
      ship.off("click", shipPlacementClickHandler);

      //side effect: occupiedCoords is a global var to store positions
      shipCoords.forEach(elem => {
        occupiedSquares.hero.push(elem);
      })

      ajaxShipCoords(ship.attr("id"), shipCoords, "hero");
    }
  }
}

//handler to move the ship around place it on the game board
let shipPlacementClickHandler = (event) => {
  let ship = $(event.target);
  let container = $("#main-container-mid");
  let gameInfoRight = $("#game-info-right");
  //0 represents vertical, 1 represents horizontal

  ship.detach().appendTo(container);
  ship.css("position", "absolute");
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

function placementFinishedHandler(){
  $("#game-info-right").empty();
  createScoreBoard();
  $(".game-log-toggle").removeClass("hidden-elem");
  $("#game-info-heading").text("Ready?");
  $("#game-info-text").text("Click to begin.");
  $(".game-log-toggle").on("click", function(){
    $(".game-log-container").toggleClass("collapsed-log");
  });
  $("#game-info-container").on("click", heroTurn);
}

let setStateGameOver = (data) => {
  $("#game-info-heading").text(`${data.winnerAlias} Wins`);
  if(data.winner === "p1"){
    var message = "Your crew basks in the glory of victory!";
  }else{
    var message = "To the bottom of the salty depths with ye!";
  }
  $("#game-info-text").text(message);
}

let heroTurn = () => {
  $("#game-info-heading").text("Your Turn");
  $("#game-info-text").text("Fire Torpedos!  Click an enemy square to fire.");
  $("#opponent-board-container").find(".board-square").on("click", squareClickHandler);
}

let displayShotMessage = (messageHeading, message) => {
  $("#game-info-heading").text(messageHeading);
  $("#game-info-text").text(message);
}

let displayShotGraphic = ($target, imgSrc) =>{
  let shotImg = $("<img/>").addClass("board-img");
  shotImg.attr("src", imgSrc);
  $target.append(shotImg);
};

let updateSunkShipScoreboard = (shipName, isHero) => {
  //$( "input[value='Hot Fuzz']" )
  let tableClassName = isHero ? ".hero-table" : ".opponent-table";
  let tdClassName = `.${shipName.toLowerCase()}-state`;
  let $tdStatus = $(tableClassName).find(tdClassName);
  $tdStatus.text("Sunk").removeClass(".operational-td").addClass("sunk-td");
};

let updateGameLog = (data) => {
  let logStr = `${data.coord} ${data.status}`;
  if(data.target) logStr += " " + data.target[0].toUpperCase() + data.target.slice(1);
  let $logEntry = $(`
    <tr>
      <td>${data.alias}:</td>
      <td>${logStr}</td>
    </tr>
  `);
  $(".game-log-table").append($logEntry);
};

//hardcoded player for now
let squareClickHandler = (event) => {
  event.stopPropagation();
  $("#opponent-board-container").find(".board-square").off("click", squareClickHandler);
  let coord = event.target.id.split("-")[1];
  let data = JSON.stringify(
    {
      coord: coord,
      shooter: "p1",
      target: "p2"
    }
  )
  $.ajax({
    type: "POST",
    url: "/client-fire",
    data: data,
    dataType: "json",
    contentType: "application/json",
    success: function(data){
      let message;
      let messageHeading;
      if(! data.status){
        messageHeading = "Again?";
        message = "You already targetted that coordinate!";
      }else{
        let imgSrc;
        if(data.status === "Miss"){
          messageHeading = data.status;
          message = "The disappointment is palpable";
          imgSrc = "/images/x.png";
        }else{
          messageHeading = `Enemy ${data.target} Hit!`;
          imgSrc = "/images/explosion-c.png";

          if(data.shipIsSunk){
            message = `You sunk the enemy's ${data.target}.`;
            updateSunkShipScoreboard(data.target, false);
          }else{
            message = `Excellent, more vodka comrade.`;
          }
        }
        let $target = $(event.target);
        displayShotGraphic($target, imgSrc);
      }
      displayShotMessage(messageHeading, message);
      updateGameLog(data);
      if(data.gameOver){
        setStateGameOver(data);
      }else{
        setTimeout(() => {
          opponentTurn();
        }, options.turnWaitTime)
      }
    }
  })
}

let opponentTurn = () => {

  $("#game-info-heading").text("Opponent Turn");
  $("#game-info-text").text("Your crew waits in hushed expectation.");
  //Set timeout so user can read opponent turn message
  setTimeout(() => {
    $.get("/ai-fire", function(data){
      let parsedData = JSON.parse(data);
      let message;
      let messageHeading;
      if(parsedData.status === "Miss"){
        messageHeading = parsedData.status;
        message = "The enemy missed. You breathe a sigh of relief.";
        imgSrc = "/images/x.png";
      }else{
        let shipName = parsedData.target[0].toUpperCase() + parsedData.target.slice(1);
        messageHeading = `${shipName} Hit!`;
        imgSrc = "/images/explosion-c.png";

        if(parsedData.shipIsSunk){
           message =`The enemy has sunk your ${parsedData.target}.`;
           updateSunkShipScoreboard(parsedData.target, true);
        }else{
          message = `Steady yourself comrade, all is not lost.`;
        }
      }
      updateGameLog(parsedData);
      let target = $(`#hero-${parsedData.coord}`);
      displayShotGraphic(target, imgSrc);
      displayShotMessage(messageHeading, message);

      //set timeout so that user can read turn result message
      setTimeout(() =>{
        if(parsedData.gameOver){
          setStateGameOver();
        }else{
          setTimeout(() => {
            heroTurn();
          }, options.turnWaitTime)
        }
      })
    })
  }, 2000)
}

createBoards(options, ["hero-board-container", "opponent-board-container"]);
$(document).ready(() => {
  $("#game-info-right").find("td").on("click", function(event){
    let selectedOpponentName = $(event.target).text();
    $("#game-info-left").find("#opponent-input").val(selectedOpponentName);
  })

  $("#start-game-button").on("click", function(event){
    let $form = $(event.target).parent();
    let userName = $form.find(".start-game-input").val();
    let opponentName = $form.find("#opponent-input").val();
    let data = JSON.stringify({userName: userName, opponentName: opponentName});
    event.preventDefault();
    if(userName && opponentName){
      $.ajax({
        url: "/start",
        type: "POST",
        dataType: "json",
        contentType:"application/json",
        data: data,
        success: function(resData){
          $gameInfoRight = $("#game-info-right");
          $gameInfoRight.empty();
          $gameInfoRight.data("userName", userName);
          $gameInfoRight.data("wins", resData.wins);
          $gameInfoRight.data("losses", resData.losses);
          $gameInfoRight.data("opponentName", opponentName);
          $("#game-info-left").find("form").remove();
          $.getJSON("/place-ships", {}, (data) => {
            let shipsObj = JSON.parse(data);
            placeComputerShips(shipsObj);
            displayShipPlacementInfo(shipsObj, options);
          })
        }
      })
    }else{
      $("#game-info-text").text("We're still waiting for a name...");
    }
  })
})