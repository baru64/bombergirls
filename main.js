import { Canvas } from './modules/canvas.js';
import { Game } from './modules/game.js';
import { Player } from './modules/player.js';
import { User } from './modules/user.js';
import { Synchronizer, UserJoinMessage, ServerMessageType } from './modules/synchronizer.js';

function main(screen) {
  let user = new User('joe');
  // user input
  document.addEventListener("keydown", function(e) {
    user.keyboardHandler(e);
  }, false);
  let game = null;
  let player = null;
  // let usersPlayer = new Player( 123, 32, 32, 2);
  // let join_msg = new UserJoinMessage(1, user.nickname);
  // console.log('sending join message');
  // synchronizer.sendMessage(join_msg);
  console.log('after sending join message');
  while(!synchronizer.in_game) {
    if (!synchronizer.receivedMessages.isEmpty()) {
      let msg = synchronizer.recvMessage();
      if(msg != null && msg.type == ServerMessageType.JoinInfo) {
        player = new Player(msg.player_id, msg.player_x, msg.player_y, msg.player_color);
        player.isDead = msg.is_player_dead;
        player.stats = msg.player_stats;
        game = new Game([player], synchronizer, user);
        synchronizer.in_game = true;
      }
    }
    console.log('wtf');
    // setTimeout(function(){ console.log('waiting for joininfo')}, 1000);
  }
  user.setPlayer(player);
  // let players = [usersPlayer];
  // TODO: new synchr, join game, create game, leave and destroy game
  // let game = new Game(players, synchronizer, user);
  // main loop
  console.log('main loop');
  function main_loop() {
    screen.clear();
    game.render(screen);
    game.updateState();
  }
  setInterval(main_loop, 25);
}

let screen = new Canvas('canvas', document.body, 600, 450);

screen.create();
function main_callback() {
  main(screen);
}
// TODO main loop callback, onopen->send join->onmessage->start main
let synchronizer = new Synchronizer("ws://localhost:8080/ws", main_callback);
