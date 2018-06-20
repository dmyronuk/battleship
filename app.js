const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

class Ship {
  constructor(name, length) {
    this.name = name;
    this.length = length;
    this.hits = 0;
    this.isOperational = true;
    this.isPlaced = false;
  }

  checkIfSunk(){
    let isSunk = this.hits === this.length;
    if(isSunk){
      this.isOperational = false;
    }
    return isSunk;
  }
};

/*possible states for each square of board:
  unoccupied & not hit -> undefined
  unoccupied & hit -> 1
  occupied & not hit -> {name:shipName, hit:false}
  occupied & hit: {name:shipName, hit: true}
*/

class Player {
  constructor(num){
    this.playerId = num;
    this.board = {}
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

  allShipsPlaced(){
    return Object.keys(this.ships).reduce((acc, cur) => {
      let curShip = this.ships[cur];
      return acc && curShip.isPlaced;
    }, true)
  }

  generateRandomCoords(){
    let randCol = Math.ceil(Math.random() * 10);
    let randRow = String.fromCharCode(Math.floor(Math.random() * 10) + 65);
    return randRow + randCol;
  }
};

class Game {
  constructor(){
    this.currentPlayerId = 1;
    //hero is "p1" and AI is "p2 by default"
    this.players = this.initPlayers();
    this.hero = "p1";
  }

  initPlayers(){
    let players = {}
    for(let i = 1; i < 3; i++){
      let curPlayer = new Player(i);
      players[`p${i}`] = curPlayer;
    }
    return players;
  }

  getHero(){
    return this.players[this.hero];
  }

  setNextPlayer(){
    this.currentPlayerId = this.currentPlayerId % 2 + 1;
  }

  playerTurn(shooter, target, coord){
    let targetUser = this.players[target];
    let prevCoordState = targetUser.board[coord];
    let outData = {
      coord:coord,
      status:null,
      target:null,
    };

    if(prevCoordState === undefined){
      targetUser.board[coord] = 1;
      outData.status = "Miss";
    //state 1 means that the square is empty and it has already been shot at
    }else if(prevCoordState !== 1){
      let hitShipName = prevCoordState.name;
      outData.target = hitShipName;
      //if haven't already hit this battleship
      if(prevCoordstate.hit = false){
        let hitShipObj = targetUser.ships[hitShipName];
        hitShipObj.hits += 1;
        hitShipObj.checkIfSunk();
        outData.status = "Hit"
      }
    }
    this.setNextPlayer();
    return outData;
  }
};

let curGame;

app.get("/", (req, res) => {
  res.render("index")
  curGame = new Game();
})

app.get("/place-ships", (req, res) => {
  let ships = curGame.getHero().ships;
  let shipsJSON = JSON.stringify(ships);
  res.json(shipsJSON);
})

app.post("/place-ships", (req, res) => {
  let data = req.body;
  let shipName = data.name;
  let coords = data.coords;
  let player;

  if(data.playerName === "hero"){
    player = curGame.getHero()
  }else{
    player = curGame.players["p2"];
  }

  player.ships[shipName].isPlaced = true;
  coords.forEach((coord) => {
    player.board[coord] = {name:shipName, hit:false};
  })

  console.log("Player 1 Board: ", curGame.players.p1.board + "\n")
  console.log("Plyaer 2 Board:", curGame.players.p2.board)

  let resData = JSON.stringify(player.allShipsPlaced());
  res.send(resData);
});

app.post("/client-fire", (req, res) => {
  let data = req.body;
  let outData = curGame.playerTurn(data.shooter, data.target, data.coord);
  let outJSON = JSON.stringify(outData);
  console.log("Response from server to hero shot: ", outJSON)
  res.send(outJSON);
});

app.get("/ai-fire", (req, res) => {
  setTimeout(() => {
    let cpuPlayer = curGame.players.p2;
    let coords;

    while(! coords){
      let testCoords = cpuPlayer.generateRandomCoords();
      let squareState = curGame.players.p1.board[testCoords];
      //not squareState means space hasn't been fired on and is empty - not status 1 means it's not fired on but occupied
      if(! squareState || ! squareState.status === 1){
        coords = testCoords;
      }
    }

    let outData = curGame.playerTurn("p2", "p1", coords);
    let outJSON = JSON.stringify(outData);
    console.log("Response from server from enemy shot: ", outJSON)
    res.send(outJSON);
  }, 2000)
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});