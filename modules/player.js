class Player {
  constructor(id, x, y) {
    this.id = id; // id received from the server
    this.x = x;
    this.y = y;
    this.sprite = {x: 0, y: 0};
    this.moveStep = 16;
    this.game = null;
    this.isDead = false;
  }

  draw(screen) {
    screen.drawSprite(this.x, this.y, this.sprite);
  }

  move(direction) {
    switch (direction) {
      case 'up':
        if (this.game.movePlayer(this, this.x, this.y-this.moveStep)) {
          this.y -= this.moveStep;
        }
        break;
      case 'down':
        if (this.game.movePlayer(this, this.x, this.y+this.moveStep)) {
          this.y += this.moveStep;
        }
        break;
      case 'left':
        if (this.game.movePlayer(this, this.x-this.moveStep, this.y)) {
          this.x -= this.moveStep;
        }
        break;
      case 'right':
        if (this.game.movePlayer(this, this.x+this.moveStep, this.y)) {
          this.x += this.moveStep;
        }
        break;
    }
  }

  placeBomb() {
    this.game.addBomb(this.x, this.y);
  }
}

export { Player };
