class Player {
  constructor(id, x, y, color) {
    this.id = id; // id received from the server
    this.x = x;
    this.y = y;
    // color: <0;3>
    this.color = color;
    this.sprite = {x: color, y: 6};
    this.moveStep = 16;
    this.game = null;
    this.isDead = false;
    this.stats = 0;
  }

  draw(screen) {
    if (this.isDead) return;
    this.sprite = {x: this.color, y: 6};
    screen.drawSprite(this.x, this.y, this.sprite);
  }

  // TODO refactor or change movement to remove lag
  move(direction) {
    switch (direction) {
      case 'up':
        if (this.game.movePlayer(this, this.x, this.y-this.moveStep, direction)) {
          // this.y -= this.moveStep;
        }
        break;
      case 'down':
        if (this.game.movePlayer(this, this.x, this.y+this.moveStep, direction)) {
          // this.y += this.moveStep;
        }
        break;
      case 'left':
        if (this.game.movePlayer(this, this.x-this.moveStep, this.y, direction)) {
          // this.x -= this.moveStep;
        }
        break;
      case 'right':
        if (this.game.movePlayer(this, this.x+this.moveStep, this.y, direction)) {
          // this.x += this.moveStep;
        }
        break;
    }
  }

  placeBomb() {
    this.game.addBomb(this.x, this.y);
  }
}

export { Player };
