const ExplosionElement = {
  Center: {x: 0, y: 0},
  UpperMid: {x: 0, y: 1},
  UpperEnd: {x: 0, y: 2},
  LowerMid: {x: 0, y: -1},
  LowerEnd: {x: 0, y: -2},
  LeftMid: {x: -1, y: 0},
  LeftEnd: {x: -2, y: 0},
  RightMid: {x: 1, y: 0},
  RightEnd: {x: 2, y: 0},
};

class ExplosionEffect {

  constructor(x, y, game) {
    this.x = x;
    this.y = y;
    this.game = game;
    this.sprite = {x: 2, y: 3};
    this.timeout = 10;
  }

  draw(screen) {
    screen.drawTile(this.x, this.y, {
      x: this.sprite.x+ExplosionElement.Center.x,
      y: this.sprite.y+ExplosionElement.Center.x
    });
    this.timeout -= 1;
    if (this.timeout == 0) this.game.effectExpired(this);
  }
}

export { ExplosionEffect };
