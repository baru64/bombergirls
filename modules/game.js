import { Map, TileType } from './map.js';
// TODO add players to constructor
// TODO add synchronizer to constructor
// TODO add effects to constructor
class Game {
  constructor(players) {
    this.map = new Map();
    this.players = players;
    this.players.forEach((player) => {
      player.game = this;
    });

  }

  render(screen) {
    this.map.draw(screen);
    this.players.forEach((player) => {
      player.draw(screen);
    });
    // draw bombs
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
    for (let i = 0; i < this.map.tiles.length; ++i) {
      let tile = this.map.tiles[i];
      if (tile.type == TileType.Wall) {
        if (x < tile.x*32+32 &&
            x+32 > tile.x*32 &&
            y < tile.y*32+32 &&
            y+32 > tile.y*32) return false;
      }
    }
    // TODO send message to server
    return true;
  }

  // NOTES: addBomb and explosion, check how bombs look like
  // and implement server then

  addBomb(x, y) {
    // calculate coordinates in grid under player
    // add new Bomb to bomb array
    // send message to synchronizer
  }

  explosion(bomb, x, y) {
    // delete bomb from array
    // add explosion effect, burning walls are a part of animation
    // kill hit players - synchronizer will tell us to do it anyway
  }
}

export { Game };
