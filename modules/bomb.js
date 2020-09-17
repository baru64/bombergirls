class Bomb {
  constructor(x, y, game) {
    this.x = x;
    this.y = y;
    this.sprite = {x: 1, y: 0};
    this.game = game;
    this.animationInterval = 5;
    this.animationCounter = this.animationInterval;
    this.timeout = 60;
  }
  animate() {
    this.sprite.x = 1 + ((this.sprite.x+1) % 3); // x = 1,2,3
    this.animationCounter = this.animationInterval;
  }

  draw(screen) {
    this.animationCounter -= 1;
    if (this.animationCounter == 0) this.animate();
    screen.drawTile(this.x, this.y, this.sprite);
    // TODO probably server will decide about explosion and this won't exist
    // this.timeout -= 1;
    // if (this.timeout == 0) this.explode();
  }

  explode() {
    this.game.explosion(this, this.x, this.y);
  }
}

export { Bomb };
