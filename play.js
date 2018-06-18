createBoards(options, ["hero-board-container", "opponent-board-container"]);
var curGame = new Game();

displayShipPlacementInfo(curGame.getHero().ships, options);