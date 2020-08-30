import { TileType } from './map.js';

const ExplosionElement = {
  Center: {x: 0, y: 0},
  UpperMid: {x: 0, y: 1},
  UpperEnd: {x: 0, y: 2},
  LowerMid: {x: 0, y: -1},
  LowerEnd: {x: 0, y: -2},
  LeftMid: {x: -1, y: 0},
  LeftEnd: {x: -2, y: 0},
  RightMid: {x: 1, y: 0},
  RightEnd: {x: 2, y: 0},
};

class ExplosionEffect {
  constructor(x, y, game) {
    this.x = x;
    this.y = y;
    this.game = game;
    this.sprite = {x: 2, y: 3};
    this.size = {up: 0, down: 0, left: 0, right: 0};
    this.timeout = 10;
    this.strength = 2;
    this.calculateSize();
  }

  calculateSize() {
    let wallsToDestroy = new Array();
    // up
    for (let i = 1; i <= this.strength; ++i) {
      // check tile
      let tileKey = this.game.map.size.x*(this.y-i) + this.x;
      let tile = this.game.map.tiles.get(tileKey);
      if (tile === undefined) this.size.up += 1;
      else if (tile.type == TileType.Wall) {
        wallsToDestroy.push(tileKey);
        break;
      } else break;
    }
    // down
    for (let i = 1; i <= this.strength; ++i) {
      // check tile
      let tileKey = this.game.map.size.x*(this.y+i) + this.x;
      let tile = this.game.map.tiles.get(tileKey);
      if (tile === undefined) this.size.down += 1;
      else if (tile.type == TileType.Wall) {
        wallsToDestroy.push(tileKey);
        break;
      } else break;
    }
    // right
    for (let i = 1; i <= this.strength; ++i) {
      // check tile
      let tileKey = this.game.map.size.x*this.y + this.x + i;
      let tile = this.game.map.tiles.get(tileKey);
      if (tile === undefined) this.size.right += 1;
      else if (tile.type == TileType.Wall) {
        wallsToDestroy.push(tileKey);
        break;
      } else break;
    }
    // left
    for (let i = 1; i <= this.strength; ++i) {
      // check tile
      let tileKey = this.game.map.size.x*this.y + this.x - i;
      let tile = this.game.map.tiles.get(tileKey);
      if (tile === undefined) this.size.left += 1;
      else if (tile.type == TileType.Wall) {
        wallsToDestroy.push(tileKey);
        break;
      } else break;
    }
    // TODO delete this in online play
    this.game.destroyWalls(wallsToDestroy);
  }

  draw(screen) {
    screen.drawTile(this.x, this.y, {
      x: this.sprite.x+ExplosionElement.Center.x,
      y: this.sprite.y+ExplosionElement.Center.y
    });
    // up
    for (let i = 1; i <= this.size.up; ++i) {
      if (i == this.strength) {
        screen.drawTile(this.x, this.y-i, {
          x: this.sprite.x+ExplosionElement.UpperEnd.x,
          y: this.sprite.y+ExplosionElement.UpperEnd.y
        });
      } else {
        screen.drawTile(this.x, this.y-i, {
          x: this.sprite.x+ExplosionElement.UpperMid.x,
          y: this.sprite.y+ExplosionElement.UpperMid.y
        });
      }
    }
    // down
    for (let i = 1; i <= this.size.down; ++i) {
      if (i == this.strength) {
        screen.drawTile(this.x, this.y+i, {
          x: this.sprite.x+ExplosionElement.LowerEnd.x,
          y: this.sprite.y+ExplosionElement.LowerEnd.y
        });
      } else {
        screen.drawTile(this.x, this.y+i, {
          x: this.sprite.x+ExplosionElement.LowerMid.x,
          y: this.sprite.y+ExplosionElement.LowerMid.y
        });
      }
    }
    // left
    for (let i = 1; i <= this.size.left; ++i) {
      if (i == this.strength) {
        screen.drawTile(this.x-i, this.y, {
          x: this.sprite.x+ExplosionElement.LeftEnd.x,
          y: this.sprite.y+ExplosionElement.LeftEnd.y
        });
      } else {
        screen.drawTile(this.x-i, this.y, {
          x: this.sprite.x+ExplosionElement.LeftMid.x,
          y: this.sprite.y+ExplosionElement.LeftMid.y
        });
      }
    }
    // right
    for (let i = 1; i <= this.size.right; ++i) {
      if (i == this.strength) {
        screen.drawTile(this.x+i, this.y, {
          x: this.sprite.x+ExplosionElement.RightEnd.x,
          y: this.sprite.y+ExplosionElement.RightEnd.y
        });
      } else {
        screen.drawTile(this.x+i, this.y, {
          x: this.sprite.x+ExplosionElement.RightMid.x,
          y: this.sprite.y+ExplosionElement.RightMid.y
        });
      }
    }
    this.timeout -= 1;
    if (this.timeout == 0) this.game.effectExpired(this);
  }
}

// BurnedWallEffect is created in place of destroyed wall
class BurnedWallEffect {
  constructor(x, y, game) {
    this.x = x;
    this.y = y;
    this.game = game;
    this.sprite = {x: 6, y: 0};
    this.timeout = 10;
  }

  draw(screen) {
    screen.drawTile(this.x, this.y, this.sprite);
    this.timeout -= 1;
    if (this.timeout == 0) this.game.effectExpired(this);
  }
}

export { ExplosionEffect, BurnedWallEffect };
