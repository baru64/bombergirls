import { GameMap, TileType } from './map.js';
import { Bomb } from './bomb.js';
import { ExplosionEffect, BurnedWallEffect } from './effects.js';
// TODO add synchronizer to constructor
class Game {
  constructor(players) {
    this.map = new GameMap();
    this.players = players;
    this.players.forEach((player) => {
      player.game = this;
    });
    this.bombs = new Array();
    this.effects = new Array();
  }

  render(screen) {
    this.map.draw(screen);
    this.players.forEach((player) => {
      player.draw(screen);
    });
    this.bombs.forEach((bomb) => {
      bomb.draw(screen);
    });
    this.effects.forEach((effect) => {
      effect.draw(screen);
    });
  }

  movePlayer(player, x, y) {
    // TODO change hardcoded 32 with tile size
    // collison with border blocks
    if (x < 32 || x > (this.map.size.x-2)*32
        || y < 32 || y > (this.map.size.y-2)*32) {
      return false;
    }
    // collision with inner blocks
    if ((x-32)%64 < 32+32 &&
        (x-32)%64+32 > 32 &&
        (y-32)%64 < 32+32 &&
        (y-32)%64+32 > 32) return false;
    // collision with walls
    let tile_x = Math.ceil(x / 32);
    let tile_y = Math.ceil(y / 32);
    let tile = this.map.tiles.get(tile_y*this.map.size.x+tile_x);
    if (tile !== undefined && tile.type == TileType.Wall) return false;
    // TODO send message to server
    return true;
  }

  // NOTES: addBomb and explosion, check how bombs look like
  // and implement server then

  addBomb(x, y) {
    // calculate coordinates in grid under player
    // add new Bomb to bomb array
    let tile_x = Math.floor(x / 32);
    let tile_y = Math.floor(y / 32);
    let bomb = new Bomb(tile_x, tile_y, this);
    this.bombs.push(bomb);
    // send message to synchronizer
  }

  explosion(bomb, x, y) {
    // delete bomb from array
    // add explosion effect, burning walls are a part of animation
    let index = this.bombs.indexOf(bomb);
    this.bombs.splice(index, 1);
    let explosionEffect = new ExplosionEffect(x, y, this);
    this.effects.push(explosionEffect);
    // kill hit players - synchronizer will tell us to do it anyway
  }

  destroyWalls(walls) {
    // walls - array of tile keys
    for (let i=0; i < walls.length;++i) {
      let wall = this.map.tiles.get(walls[i]);
      let burnedWallEffect = new BurnedWallEffect(wall.x, wall.y, this);
      this.effects.push(burnedWallEffect);
      this.map.tiles.delete(walls[i]);
    }
  }

  effectExpired(effect) {
    let index = this.effects.indexOf(effect);
    this.effects.splice(index, 1);
  }
}

export { Game };
