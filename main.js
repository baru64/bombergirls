import { Canvas } from './modules/canvas.js';
import { Game } from './modules/game.js';
import { Player } from './modules/player.js';
import { User } from './modules/user.js';
import { Synchronizer } from './modules/synchronizer.js';

function main(screen) {
  let user = new User('joe');
  // user input
  document.addEventListener("keydown", function(e) {
    user.keyboardHandler(e);
  }, false);
  let usersPlayer = new Player( 123, 32, 32, 2);
  let synchronizer = new Synchronizer("ws://localhost:8080/ws");
  user.setPlayer(usersPlayer);
  let players = [usersPlayer];
  // TODO: new synchr, join game, create game, leave and destroy game
  let game = new Game(players, synchronizer, user);
  // main loop
  function main_loop() {
    screen.clear();
    game.render(screen);
    game.updateState();
  }
  setInterval(main_loop, 25);
}

let screen = new Canvas('canvas', document.body, 600, 450);

screen.create();
main(screen)
