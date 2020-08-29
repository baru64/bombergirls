import { Canvas } from './modules/canvas.js';
import { Game } from './modules/game.js';
import { Player } from './modules/player.js';
import { User } from './modules/user.js';

function main(screen) {
  let user = new User('joe');
  // user input
  document.addEventListener("keydown", function(e) {
    user.keyboardHandler(e);
  }, false);
  let usersPlayer = new Player( 123, 32, 32);
  user.setPlayer(usersPlayer);
  let players = [usersPlayer];
  let game = new Game(players);
  // main loop
  function main_loop() {
    screen.clear();
    game.render(screen);
  }
  setInterval(main_loop, 25);
}

let screen = new Canvas('canvas', document.body, 600, 450);

screen.create();
main(screen)
