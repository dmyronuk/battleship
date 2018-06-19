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
    player.board[coord] = shipName;
  });

  console.log(curGame.players.p1.board)
  console.log(curGame.players.p2.board)

  let resData = JSON.stringify(player.allShipsPlaced());
  res.send(resData);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})