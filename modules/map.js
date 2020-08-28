const TileType =  {
  Block: 1,
  Wall: 2
}

const TileSprite = {
  1: {x: 4, y: 0},
  2: {x: 5, y: 0},
}


class Map {
  constructor() {
    this.tiles = new Array();
    this.size = {x: 15, y: 13};
    this.generateTiles();
    this.firstDraw = true;
  }

  generateTiles() {
    for (let j = 0; j < this.size.y; ++j) {
      for (let i = 0; i < this.size.x; ++i) {
        // blocks
        if (i == 0 || i == (this.size.x-1) || j == 0 || j == (this.size.y-1) ||
            ((i % 2 == 0) && (j % 2 == 0))) {
          this.tiles.push(new Tile(i, j, TileType.Block));
        }
        // walls !(i > 1 && i < (this.size.x-2) && j > 1 && j < (this.size.y-2))
        else if (!((i < 3 || i > this.size.x-4) && (j < 3 || j > this.size.y-4))) {
          this.tiles.push(new Tile(i, j, TileType.Wall))
        }
      }
    }
  }

  draw(screen) {
    screen.drawRectangle('darkgreen', 0, 0, this.size.x*32, this.size.y*32);
    this.tiles.forEach((tile) => {
      if (this.firstDraw) tile.draw(screen);
      else if (tile.type != TileType.Block) tile.draw(screen);
    });

  }
}

class Tile {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
  }

  draw(screen) {
    screen.drawTile(this.x, this.y, TileSprite[this.type]);
  }
}

class WallTile extends Tile {
  constructor(x ,y) {
    super(x, y, TileType.Wall);
    this.destroy_timeout = 5;
    this.destroy_trigger = false;
  }

  draw(screen) {
    screen.drawTile(this.x, this.y, TileSprite[this.type]);
    // if destroy triggered run animation / change sprite
  }
}

export { Map };
