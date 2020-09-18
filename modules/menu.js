class Menu {
  constructor() {
    this.text_input = 'nick';
    this.room_input = 1;
    this.menu_selection = 0;
    this.enterGame = false;
    this.room_id = 1;
    this.nickname = 'nick';
  }

  draw(screen) {
    screen.drawRectangle('black', 0, 0, screen.width, screen.height);
    // header
    screen.drawText('60px sans', 'white', 80, screen.height/3, 'Bomber Girls');
    // inputs
    if (this.menu_selection == 0) {
      screen.drawText('16px sans', 'lightgray',
        screen.width/2-180,(screen.height/3)*2, 'nickname:');
      screen.drawText('16px sans', 'gray',
        screen.width/2-180, (screen.height/3)*2+20, 'room:');
      screen.drawText('16px sans', 'orange',
        screen.width/2-80, (screen.height/3)*2, this.text_input);
      screen.drawText('16px sans', 'white',
        screen.width/2-80, (screen.height/3)*2+20, this.room_input);
    } else {
      screen.drawText('16px sans', 'gray',
        screen.width/2-180,(screen.height/3)*2, 'nickname:');
      screen.drawText('16px sans', 'lightgray',
        screen.width/2-180, (screen.height/3)*2+20, 'room:');
      screen.drawText('16px sans', 'white',
        screen.width/2-80,(screen.height/3)*2, this.text_input);
      screen.drawText('16px sans', 'orange',
        screen.width/2-80, (screen.height/3)*2+20, this.room_input);
    }
    // footer
    screen.drawText('8px sans', 'white', screen.width/2-10, screen.height-5, 'v0.0.1');
  }

  getInput(e) {
    if (e.code == 'ArrowUp') {
      this.menu_selection = Math.abs(this.menu_selection - 1) % 2;
    } else if (e.code == 'ArrowDown') {
      this.menu_selection = Math.abs(this.menu_selection + 1) % 2;
    } else if (e.code == 'Enter') {
      this.nickname = this.text_input;
      this.room_id = parseInt(this.room_input);
      this.enterGame = true;
      console.log('enter game');
    } else if (this.menu_selection == 0) {
      if (e.keyCode >= 65 && e.keyCode <= 90) {
        this.text_input = this.text_input + e.key;
      } else if (e.code == 'Backspace' && this.text_input.length > 0) {
        this.text_input = this.text_input.slice(0, -1);
      }
    } else if (this.menu_selection == 1) {
      if (e.keyCode >= 48 && e.keyCode <= 57) {
        this.room_input = this.room_input + e.key;
      } else if (e.code == 'Backspace' && this.room_input.length > 0) {
        this.room_input = this.room_input.slice(0, -1);
      }
    }
  }

}

export { Menu };
