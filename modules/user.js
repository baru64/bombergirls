import { Menu } from './menu.js';

const GameState = {
  inGame: 1,
  inMainMenu: 2
}

// note: when state changes ingame->inmainmenu, delete current game and sync

class User {
  constructor(nickname) {
    this.nickname = nickname;
    this.player = null;
    this.room_id = 0;
    this.state = GameState.inMainMenu;
    this.selectedRoom = 0;
    this.menu = new Menu();
  }

  setPlayer(player) {
    this.player = player;
    console.log(this.player);
  }

  keyboardHandler(e) {
    if (this.state == GameState.inGame) {
      switch (e.code) {
        case "ArrowLeft":
          this.player.move('left');
          break;
        case "ArrowRight":
          this.player.move('right');
          break;
        case "ArrowUp":
          this.player.move('up');
          break;
        case "ArrowDown":
          this.player.move('down');
          break;
        case "Space":
          this.player.placeBomb();
          break;
      }
    } else if (this.state == GameState.inMainMenu) {
      this.menu.getInput(e);
      if (this.menu.enterGame == true) {
        this.nickname = this.menu.nickname;
        this.room_id = this.menu.room_id;
        this.state = GameState.inGame;
      }
    }
  }
}

export { User, GameState };
