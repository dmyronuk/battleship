let options = {
  squareWidth: 35,
  squareHeight: 35,
  squareColorA: "blue",
  squareColorB: "#e5e5ff",
}

createBoards(options, ["hero-board-container", "opponent-board-container"]);

$(document).ready( () => {
  $.getJSON("/place-ships", {}, (data) => {
    let shipsObj = JSON.parse(data);
    placeComputerShips(shipsObj);
    displayShipPlacementInfo(shipsObj, options);
  })
})

