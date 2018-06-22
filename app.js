const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;
const fs = require("fs");

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

let db = require("./database.json");

class Ship {
  constructor(name, length, image) {
    this.name = name;
    this.length = length;
    this.hits = 0;
    this.isOperational = true;
    this.isPlaced = false;
    this.imageURL = `/images/${name.toLowerCase()}.png`;
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
  unoccupied & hit -> {name:null, hit:true}
  occupied & not hit -> {name:shipName, hit:false}
  occupied & hit: {name:shipName, hit: true}
*/

let writeDB = () => {
  let outData = JSON.stringify(db);
  fs.writeFile("./database.json", outData);
}

class Player {
  constructor(num){
    this.playerId = num;
    this.board = {}
    this.ships = this.initShips();
    this.alias = null;
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

  allShipsSunk(){
    return Object.keys(this.ships).reduce((acc, cur) => {
      let curShip = this.ships[cur];
      if(curShip.isOperational){
        acc = false;
      }
      return acc;
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
    this.winner = null;
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
      status: null,
      target: null,
      shipIsSunk: false,
      gameOver: false,
    };

    if(! prevCoordState){
      targetUser.board[coord] = {name:null, hit:true};
      outData.status = "Miss";
    //state null means that the square is empty and it has already been hit
    }else if(prevCoordState.name !== null){
      let hitShipName = prevCoordState.name;
      outData.target = hitShipName;
      //if haven't already hit this battleship
      if(prevCoordState.hit === false){
        let hitShipObj = targetUser.ships[hitShipName];
        hitShipObj.hits += 1;
        outData.shipIsSunk = hitShipObj.checkIfSunk();
        outData.status = "Hit"
      }
    }
    if(targetUser.allShipsSunk()){
      curGame.winner = shooter;
      let winnerAlias = this.players[shooter].alias;
      let clientAlias = this.players.p1.alias;
      let clientGameResult = (winnerAlias === clientAlias) ? "wins" : "losses";
      db.players[clientAlias][clientGameResult] ++;
      writeDB();

      outData.winner = shooter;
      outData.winnerAlias = winnerAlias;
      outData.gameOver = true;
      return outData;
    }else{
      this.setNextPlayer();
      return outData;
    }
  }
};

let curGame;

app.get("/", (req, res) => {
  curGame = new Game();
  res.render("index");
});

app.post("/start", (req, res) => {
  let userName = req.body.userName;
  curGame.players.p1.alias = userName;
  curGame.players.p2.alias = req.body.opponentName;

  if(db.players[userName] === undefined){
    var curPlayerData = {wins:0, losses:0};
    db.players[userName] = curPlayerData;
    writeDB();
  }else{
    var curPlayerData = db.players[userName];
  }
  res.json(curPlayerData);
});

app.get("/place-ships", (req, res) => {
  let ships = curGame.getHero().ships;
  let shipsJSON = JSON.stringify(ships);
  res.json(shipsJSON);
});

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
    let newBoardEntry = {
      name:shipName,
      hit:false,
    }
    player.board[coord] = newBoardEntry;
  })

  console.log("Player 1 Board: ", curGame.players.p1.board)
  console.log("\n")
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
      // SquareState is undefined for empty square that haven't been hit so this catches a miss;
      if(! squareState){
        coords = testCoords;
      }else if(squareState.name && squareState.hit === false ){
        coords = testCoords;
      }
    }

    let outData = curGame.playerTurn("p2", "p1", coords);
    let outJSON = JSON.stringify(outData);
    res.send(outJSON);
  }, 2000)
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});