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
    this.state = GameState.inGame;
    this.selectedRoom = 0;
  }

  setPlayer(player) {
    this.player = player;
    console.log(this.player);
  }

  keyboardHandler(e) {
    if (this.state = GameState.inGame) {
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
    }

  }
}

export { User, GameState };
