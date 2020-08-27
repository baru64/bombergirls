import { Canvas } from './modules/canvas.js';
import { Game } from './modules/game.js';

const GameState = {
  inGame: 1,
  inMainMenu: 2,
  inRoomSelection: 3,
  inRoomLobby: 4
}

function main(screen) {
  let game = new Game();
  // main loop
  function main_loop() {
    screen.clear();
    game.render(screen);
  }
  setInterval(main_loop, 50);
}

let screen = new Canvas('canvas', document.body, 600, 450);

screen.create();
main(screen)
