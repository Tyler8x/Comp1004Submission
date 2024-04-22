/*import {Tile,Room,BasicRoom,getRandomInt} from BasicThemeRooms
import Triangulate from BowyerWatsonDelauneyTriangulation
import aStar from aStar*/

function getMaxOfArray(numArray) {
  biggest = 0;
  for (let i = 0; i < numArray.length; i++) {
    if (biggest < numArray[i]) {
      biggest = numArray[i];
    }
  }
  return biggest;
}

function getMinOfArray(numArray) {
  smallest = 99999;
  for (let i = 0; i < numArray.length - 1; i++) {
    if (smallest > numArray[i]) {
      smallest = numArray[i];
    }
  }
  return smallest;
}

class Dungeon {
  constructor(dunSize = 100, rooms = 10, tileSize = 32, corridorChance = 10) {
    //dunSize is the size of the grid in tiles (Int), rooms is no. of room (Int), tileSize is the resolution of the tiles (Int), corridorChance is the % chance of additional corridors (Int 1-100)
    this.dunSize = dunSize;
    this.numberOfRooms = rooms + (this.dunSize - 30) / 5;
    this.tileSize = tileSize;
    this.corridorChance = corridorChance;
    this.Generate();
    this.map = this.aStar();
    this.TextureAlign();
  }
  Generate() {
    this.PlaceRooms();
    this.BWDT();
    this.MSTCalc();
  }
  PlaceRooms() {
    let done = false;
    while (!done) {
      done = true;
      this.map = [];
      for (let i = 0; i < this.dunSize; i++) {
        this.map.push([]);
        for (let j = 0; j < this.dunSize; j++) {
          this.map[i].push([]);
          this.map[i][j] = new Tile("Empty", "202020", ".", 1, "Empty");
        }
      }
      this.pointList = [];
      for (let i = 0; i < this.numberOfRooms; i++) {
        let MAX_ATTEMPTS = 20;
        let placed = false;
        for (let j = 0; j < MAX_ATTEMPTS; j++) {
          this.pointList.push([
            getRandomInt(
              Math.floor(Number(this.dunSize / 5)),
              Math.floor(Number((this.dunSize * 4) / 5))
            ),
            getRandomInt(
              Math.floor(Number(this.dunSize / 5)),
              Math.floor(Number((this.dunSize * 4) / 5))
            ),
          ]);
          var room = new BasicRoom(
            this.pointList[this.pointList.length - 1],
            this.dunSize,
            this.numberOfRooms
          );
          let placedRoom = room.PlaceRoom(this.map);
          if (placedRoom != "Error placing room") {
            this.map = placedRoom;
            placed = true;
            break;
          }
          this.pointList.pop(-1);
        }
        if (!placed) {
          done = false;
          break;
        }
      }
    }
  }
  print() {
    let printable = "";
    for (let i = 0; i < this.dunSize; i++) {
      for (let j = 0; j < this.dunSize; j++) {
        printable = printable + this.map[i][j].char;
      }
      printable = printable + "\n";
    }
    console.log(printable);
  }
  BWDT() {
    this.triangulation = Triangulate(this.pointList);
    let listOfLines = [];
    let allTriangleEdges = [];
    for (var triangle of this.triangulation) {
      for (var triangleEdge of triangle.edges) {
        allTriangleEdges.push(triangleEdge);
      }
    }
    for (var edge of allTriangleEdges) {
      let found = false;
      for (var existingEdge of listOfLines) {
        if (edge.isEqualTo(existingEdge)) {
          found = true;
        }
      }
      if (found == false) {
        listOfLines.push([edge.p1, edge.p2]);
      }
    }
    this.allEdges = listOfLines;
  }
  MSTCalc() {
    let treeLines = Prim(this.pointList, this.allEdges);
    this.AllPaths = [];
    let found = false;
    for (var line of this.allEdges) {
      found = false;
      for (var treeLine of treeLines) {
        if (
          new Edge(line[0], line[1]).isEqualTo(
            new Edge(treeLine[0], treeLine[1])
          )
        ) {
          found = true;
        }
      }
      if (found == true) {
        this.AllPaths.push(line);
      }
    }
    let outsideLines = this.allEdges;
    for (var line of this.AllPaths) {
      let index = outsideLines.indexOf(line);
      outsideLines.splice(index, 1);
    }
    for (var line of outsideLines) {
      if (getRandomInt(1, 100) <= this.corridorChance) {
        this.AllPaths.push(line);
      }
    }
  }

  aStar() {
    for (const line of this.AllPaths) {
      //decided not to include debugging outputs here, might come back to do so if things go wrong
      let start = [line[0][0], line[0][1]];
      let end = [line[1][0], line[1][1]];
      let path = aStar(this.map, start, end);
      if (path == "Error") {
        console.log("Error, Trying again");

        this.map = [];
        for (let i = 0; i < this.dunSize; i++) {
          this.map.push([]);
          for (let j = 0; j < this.dunSize; j++) {
            this.map[i].push([]);
            this.map[i][j] = new Tile("Empty", "202020", ".", 1, "Empty");
          }
        }
        this.Generate();
        return this.aStar();
      }
      for (const item of path) {
        if (this.map[item[0]][item[1]].label == "Wall") {
          this.map[item[0]][item[1]] = new Tile(
            "Door",
            "#AA0000",
            "D",
            0.3,
            `Door${this.map[item[0]][item[1]].texture.slice(-1)}`
          );
        }
        if (this.map[item[0]][item[1]].label == "Empty") {
          this.map[item[0]][item[1]] = new Tile(
            "Corridor",
            "#CCAA00",
            "0",
            0.3,
            "Corridor"
          );
        }
      }
    }
    for (let i = 0; i < this.dunSize; i++) {
      for (let j = 0; j < this.dunSize; j++) {
        if (this.map[i][j].label == "Corridor") {
          for (let index = 0; index < 4; index++) {
            let item = [
              [1, 0],
              [0, 1],
              [-1, 0],
              [0, -1],
            ][index];
            if (this.map[i + item[0]][j + item[1]].label == "Empty") {
              this.map[i + item[0]][j + item[1]] = new Tile(
                "Wall",
                "#806000",
                "#",
                8,
                `Wall${index}`
              );
            }
          }
        }
      }
    }
    return this.map;
  }
  TextureAlign() {
    for (let i = 0; i < this.dunSize; i++) {
      for (let j = 0; j < this.dunSize; j++) {
        this.map[i][j].neighbours = [];
        if (this.map[i][j].label == "Corridor") {
          for (let temp = 0; temp < 4; temp++) {
            let item = [
              [1, 0],
              [0, 1],
              [-1, 0],
              [0, -1],
            ][temp];
            if (
              this.map[i + item[0]][j + item[1]].label in ["Corridor", "Door"]
            ) {
              this.map[i][j].neighbours.push(temp + 1);
            }
          }
          if (this.map[i][j].neighbours.length == 2) {
            if (
              getMaxOfArray(this.map[i][j].neighbours) -
                getMinOfArray(this.map[i][j].neighbours) ==
              2
            ) {
              this.map[i][j].texture = `CorridorStraight${
                ["Horizontal", "Vertical"][min(this.map[i][j].neighbours) - 1]
              }`;
            } else {
              if ((this.map[i][j].neighbours = [1, 2])) {
                TurnValue = "1";
              }
              if ((this.map[i][j].neighbours = [2, 3])) {
                TurnValue = "2";
              }
              if ((this.map[i][j].neighbours = [3, 4])) {
                TurnValue = "3";
              }
              if ((this.map[i][j].neighbours = [1, 4])) {
                TurnValue = "0";
              }
              this.map[i][j].texture = "CorridorTurn" + TurnValue;
            }
          } else if (this.map[i][j].neighbours.length == 3) {
            for (let value = 0; value < 5; value++) {
              if (!(value in this.map[i][j].neighbours)) {
                this.map[i][j].texture = `CorridorT${
                  [None, 1, 2, 3, 0][value]
                }`;
              }
            }
          } else if (this.map[i][j].neighbours.length == 4) {
            this.map[i][j].texture = "Floor";
          }
        }
        if (
          this.map[i][j].label == "Wall" ||
          this.map[i][j].label == "Corner"
        ) {
          for (let index = 0; index < 4; index++) {
            let item = [
              [1, 0],
              [0, 1],
              [-1, 0],
              [0, -1],
            ][index];
            if (
              ["Corridor", "Door", "Floor"].includes(
                this.map[i + item[0]][j + item[1]].label
              )
            ) {
              this.map[i][j].neighbours.push(index + 1);
            }
          }
          if (this.map[i][j].neighbours.length == 1) {
            this.map[i][j].texture = `Wall${
              [null, 1, 2, 3, 0][this.map[i][j].neighbours[0]]
            }`;
            for (let k = 0; k < 2; k++) {
              let position = [
                [1, 1],
                [-1, 1],
                [-1, -1],
                [1, -1],
              ][(parseInt(this.map[i][j].texture.slice(-1)) + k) % 4];
              if (
                i + position[0] < 50 &&
                i + position[0] > 0 &&
                j + position[1] < 50 &&
                j + position[1] > 0
              ) {
                if (
                  ["Floor", "Corridor"].includes(
                    this.map[i + position[0]][j + position[1]].label
                  )
                ) {
                  this.map[i][j].texture += new String(k);
                  break;
                }
              }
            }
          } else if (this.map[i][j].neighbours.length == 2) {
            if (
              getMaxOfArray(this.map[i][j].neighbours) -
                getMinOfArray(this.map[i][j].neighbours) ==
              2
            ) {
              this.map[i][j].texture = `WallStraight${
                ["Vertical", "Horizontal"][
                  getMinOfArray(this.map[i][j].neighbours) - 1
                ]
              }`;
            } else {
              let TurnValue = "";
              if (
                [1, 2].includes(this.map[i][j].neighbours[0]) &&
                [1, 2].includes(this.map[i][j].neighbours[1])
              ) {
                TurnValue = "1";
              }
              if (
                [2, 3].includes(this.map[i][j].neighbours[0]) &&
                [2, 3].includes(this.map[i][j].neighbours[1])
              ) {
                TurnValue = "2";
              }
              if (
                [3, 4].includes(this.map[i][j].neighbours[0]) &&
                [3, 4].includes(this.map[i][j].neighbours[1])
              ) {
                TurnValue = "3";
              }
              if (
                [1, 4].includes(this.map[i][j].neighbours[0]) &&
                [1, 4].includes(this.map[i][j].neighbours[1])
              ) {
                TurnValue = "0";
              }
              this.map[i][j].texture = `WallTurn${TurnValue}`;
              let position = [
                [-1, 1],
                [-1, -1],
                [1, -1],
                [1, 1],
              ][parseInt(this.map[i][j].texture.slice(-1))];
              if (
                i + position[0] < 50 &&
                i + position[0] > 0 &&
                j + position[1] < 50 &&
                j + position[1] > 0
              ) {
                if (
                  ["Floor", "Corridor"].includes(
                    this.map[i + position[0]][j + position[1]].label
                  )
                ) {
                  this.map[i][j].texture += "0";
                }
              }
            }
          } else if (this.map[i][j].neighbours.length == 3) {
            for (let value = 0; value < 5; value++) {
              if (!this.map[i][j].neighbours.includes(value)) {
                if (value == 4) {
                  this.map[i][j].texture = "WallT0";
                } else {
                  this.map[i][j].texture = `WallT${value}`;
                }
              }
            }
          } else if (this.map[i][j].neighbours.length == 4) {
            this.map[i][j].texture = "Cross";
          }
        }
        if (this.map[i][j].label == "Empty") {
          for (let k = -1; k < 2; k++) {
            for (let l = -1; l < 2; l++) {
              if (i + k + 1 < this.dunSize && j + l + 1 < this.dunSize) {
                if (i + k >= 0 && j + l >= 0) {
                  if (
                    ["Floor", "Corridor"].includes(this.map[i + k][j + l].label)
                  ) {
                    this.map[i][j].neighbours.push([k, l]);
                  }
                }
              }
            }
          }
          if (this.map[i][j].neighbours.length == 1) {
            let textureValue = "";
            if (
              this.map[i][j].neighbours[0][0] == 1 &&
              this.map[i][j].neighbours[0][1] == 1
            ) {
              textureValue = "Corner0";
            }
            if (
              this.map[i][j].neighbours[0][0] == -1 &&
              this.map[i][j].neighbours[0][1] == 1
            ) {
              textureValue = "Corner1";
            }
            if (
              this.map[i][j].neighbours[0][0] == 1 &&
              this.map[i][j].neighbours[0][1] == -1
            ) {
              textureValue = "Corner2";
            }
            if (
              this.map[i][j].neighbours[0][0] == -1 &&
              this.map[i][j].neighbours[0][1] == -1
            ) {
              textureValue = "Corner3";
            }
            this.map[i][j] = new Tile(
              "Corner",
              "#806000",
              "X",
              99,
              `${textureValue}`
            );
          }
        }
      }
    }
  }
  output() {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = dunSize * this.tileSize;
    canvas.height = dunSize * this.tileSize;
    let totalImages = this.dunSize * this.dunSize;
    for (let i = 0; i < this.dunSize; i++) {
      for (let j = 0; j < this.dunSize; j++) {
        const x = i * this.tileSize;
        const y = j * this.tileSize;
        const width = this.tileSize;
        let img = new Image();
        img.onload = function () {
          ctx.drawImage(this, x, y, width, width);
          totalImages = totalImages - 1;
          if (totalImages == 0) {
            canvas.style.opacity = 1;
          }
        };
        img.src = `Textures/${this.map[i][j].texture}.png`;
      }
    }
    const imageDisplay = document.getElementById("imageDisplay");
  }
}

function UpdateInputs() {
  selectElement = document.querySelector("#RoomNumber");
  RoomNumber = Number(selectElement.value);
  selectElement = document.querySelector("#dunSize");
  dunSize = Number(selectElement.value);
  selectElement = document.querySelector("#corridorChance");
  corridorChance = Number(selectElement.value);
  selectElement = document.querySelector("#textureSize");
  textureSize = Number(selectElement.value);
}
function Debug() {
  const canvas = document.getElementById("myCanvas");
  canvas.style.transition = "";
  canvas.style.opacity = 0.4;
  canvas.style.transition = "opacity 0.2s ease 0s";
  UpdateInputs();
  Grid = new Dungeon(
    (dunSize = dunSize),
    (rooms = RoomNumber),
    (tileSize = textureSize),
    (corridorChance = corridorChance)
  );
  Grid.output();
}
