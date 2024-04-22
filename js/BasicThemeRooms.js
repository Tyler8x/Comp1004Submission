function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

class Tile {
    constructor(label, colour, char, cost, texture) {
        this.label = label;
        this.colour = colour;
        this.char = char;
        this.cost = cost;
        if (label in ["Corridor", "Wall", "Corner", "Empty"]) {
            this.neighbours = [];
        }
        this.texture = texture;
    }
}

class BasicRoom {
    constructor(location, dunSize, rooms) {
        this.dunSize = dunSize;
        this.rooms = rooms;
        this.sizeX = Math.floor(
            getMaxOfArray([
                getRandomInt(
                    this.dunSize / (this.rooms * 2),
                    (this.dunSize * 3) / this.rooms
                ),
                5,
            ])
        );
        this.sizeY = Math.floor(
            getMaxOfArray([
                getRandomInt(
                    this.dunSize / (this.rooms * 2),
                    (this.dunSize * 3) / this.rooms
                ),
                5,
            ])
        );
        this.locationBase = location;
        this.location = [
            location[0] - getRandomInt(1, getMaxOfArray([this.sizeY - 2, 2])),
            location[1] - getRandomInt(1, getMaxOfArray([this.sizeX - 2, 2])),
        ];
    }
    PlaceRoom(Map) {
        for (let M = 0; M < 1; M++) {
            if (
                !(
                    this.location[0] - 2 > 0 &&
                    this.location[1] - 2 > 0 &&
                    this.location[0] + this.sizeY + 2 < Map[0].length &&
                    this.location[1] + this.sizeX + 2 < Map[0].length
                )
            ) {
                this.sizeX = Math.floor(
                    getMaxOfArray([
                        getRandomInt(
                            this.dunSize / (this.rooms * 2),
                            (this.dunSize * 3) / this.rooms
                        ),
                        5,
                    ])
                );
                this.sizeY = Math.floor(
                    getMaxOfArray([
                        getRandomInt(
                            this.dunSize / (this.rooms * 2),
                            (this.dunSize * 3) / this.rooms
                        ),
                        5,
                    ])
                );
                this.location = [
                    Math.floor(Number(this.dunSize / 5)),
                    Math.floor(Number((this.dunSize * 4) / 5)),
                    Math.floor(Number(this.dunSize / 5)),
                    Math.floor(Number((this.dunSize * 4) / 5)),
                ];
            } else {
                let PlacingError = false;
                for (let j = 0; j < this.sizeX; j++) {
                    for (let k = 0; k < this.sizeY; k++) {
                        if (
                            Map[k + this.location[0]][j + this.location[1]]
                                .label == "Floor"
                        ) {
                            PlacingError = true;
                        } else {
                            if (
                                Map[k + this.location[0]][j + this.location[1]]
                                    .label == "Wall"
                            ) {
                                PlacingError = true;
                            }
                        }
                    }
                }
                if (PlacingError == true) {
                    new this.constructor(
                        this.locationBase,
                        this.dunSize,
                        this.rooms
                    );
                } else {
                    for (let i = 0; i < this.sizeX + 1; i++) {
                        Map[this.location[0]][this.location[1] + i] = new Tile(
                            "Wall",
                            "#806000",
                            "#",
                            8,
                            "Wall1"
                        );
                        Map[this.location[0] + this.sizeY - 1][
                            this.location[1] + i
                        ] = new Tile("Wall", "#806000", "#", 8, "Wall3");
                    }
                    for (let i = 1; i < this.sizeY - 1; i++) {
                        Map[this.location[0] + i][this.location[1]] = new Tile(
                            "Wall",
                            "#806000",
                            "#",
                            8,
                            "Wall2"
                        );
                        Map[this.location[0] + i][
                            this.location[1] + this.sizeX
                        ] = new Tile("Wall", "#806000", "#", 8, "Wall0");
                        for (let j = 1; j < this.sizeX; j++) {
                            Map[this.location[0] + i][this.location[1] + j] =
                                new Tile("Floor", "#202020", "-", 0.3, "Floor");
                        }
                    }
                    for (let i = 0; i < 2; i++) {
                        for (let j = 0; j < 2; j++) {
                            let CornerType = "0";
                            if (i == 0 && j == 0) {
                                CornerType = "0";
                            }
                            if (i == 1 && j == 0) {
                                CornerType = "1";
                            }
                            if (i == 0 && j == 1) {
                                CornerType = "2";
                            }
                            if (i == 1 && j == 1) {
                                CornerType = "3";
                            }
                            Map[this.location[0] + (this.sizeY - 1) * i][
                                this.location[1] + this.sizeX * j
                            ] = new Tile(
                                "Corner",
                                "#806000",
                                "X",
                                99,
                                "Corner" + CornerType
                            );
                        }
                    }
                    return Map;
                }
            }
        }
        return "Error placing room";
    }
}