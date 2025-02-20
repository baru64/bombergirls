import { Canvas } from './modules/canvas.js';
import { Game } from './modules/game.js';
import { Player } from './modules/player.js';
import { User, GameState } from './modules/user.js';
import { Synchronizer, UserJoinMessage, ServerMessageType } from './modules/synchronizer.js';

function time_now() {
  return Date.now() / 1000;
}

function game_loop(screen) {
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
        player.nickname = user.nickname;
        game = new Game([player], synchronizer, user);
        game.time_left = msg.time_left;
        synchronizer.in_game = true;
        // set session storage
        sessionStorage.setItem("round_end",
          Math.floor(time_now() + game.time_left));
        sessionStorage.setItem("room_id", user.room_id);
        sessionStorage.setItem("nickname", user.nickname);
        sessionStorage.setItem("player_code", msg.player_code);
        console.log('player_code: ' + msg.player_code);
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
    if (user.state == GameState.inMainMenu) {
      clearInterval(main_loop_interval);
      synchronizer.disconnect();
      menu_loop(screen);
    }
  }
  let main_loop_interval = setInterval(main_loop, 25);
}

let screen = new Canvas('canvas', document.body, 700, 450);

let user = new User('joe');
// user input
document.addEventListener("keydown", function(e) {
  user.keyboardHandler(e);
}, false);

screen.create();
function game_loop_callback() {
  game_loop(screen);
}

let synchronizer = null;

async function menu_loop(screen) {
  while (user.state == GameState.inMainMenu) {
    user.menu.draw(screen);
    await new Promise(r => setTimeout(r, 100));
  } 
  if (user.state == GameState.inGame) {
    // TODO main loop callback, onopen->send join->onmessage->start main
    synchronizer = new Synchronizer("ws://localhost:8080/ws", user);
    synchronizer.connect(game_loop_callback);
  }
}
console.log(screen);

// restore previous user settings
if (sessionStorage.getItem('room_id') &&
    sessionStorage.getItem('nickname') &&
    sessionStorage.getItem('player_code') &&
    sessionStorage.getItem('round_end')) {
  let round_end = sessionStorage.getItem('round_end');
  user.menu.room_id = sessionStorage.getItem('room_id');
  user.menu.nickname = sessionStorage.getItem('nickname');
  if (time_now() < round_end) {
    console.log('rejoin last game');
    user.room_id = sessionStorage.getItem('room_id');
    user.nickname = sessionStorage.getItem('nickname');
    user.player_code = sessionStorage.getItem('player_code');
    user.state = GameState.inGame;
  }
}

menu_loop(screen);