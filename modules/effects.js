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

  constructor(x,y) {
    this.x = x;
    this.y = y;
    this.sprite = {x: 2, y: 3};
    this.timeout = 20;
  }

  draw(screen) {
    screen.drawTile(this.x, this.y, {
      this.sprite.x+ExplosionElement.Center.x,
      this.sprite.y+ExplosionElement.Center.x
    });
  }
}

export { ExplosionEffect };
