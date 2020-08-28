import { Map } from './map.js';
// TODO add players to constructor
// TODO add synchronizer to constructor
// TODO add effects to constructor
class Game {
  constructor() {
    this.map = new Map();
  }

  render(screen) {
    this.map.draw(screen);
    // draw players
    // draw bombs
  }

  movePlayer(player, x, y) {
    // check possibility and send message to synchronizer
    // return true if possible
  }

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
