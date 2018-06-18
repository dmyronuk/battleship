let options = {
  squareWidth: 35,
  squareHeight: 35,
  squareColorA: "blue",
  squareColorB: "#e5e5ff",
}

createBoards(options, ["hero-board-container", "opponent-board-container"]);

$(document).ready( () => {
  $.getJSON("/place-hero-ships", {}, (data) => {
    let shipsObj = JSON.parse(data);
    //need to convert it to an array of objects to work with existing code
    displayShipPlacementInfo(shipsObj, options);
  })
})

