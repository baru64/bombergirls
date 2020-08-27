import { Map } from './map.js';
// TODO add players to constructor
class Game {
  constructor() {
    this.map = new Map();
  }

  render(screen) {
    this.map.draw(screen);
    // draw players
    // draw bombs
  }
}

export { Game };
