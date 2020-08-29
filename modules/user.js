const GameState = {
  inGame: 1,
  inMainMenu: 2,
  inRoomSelection: 3,
  inRoomLobby: 4
}

class User {
  constructor(nickname) {
    this.nickname = nickname;
    this.player = null;
    this.state = GameState.inGame;
    this.selectedRoom = 0;
  }

  setPlayer(player) {
    this.player = player;
    console.log(this.player);
  }

  keyboardHandler(e) {
    console.log(this.player);
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

export { User };
