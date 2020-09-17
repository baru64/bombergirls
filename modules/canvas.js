class Canvas {
  constructor(id, parent, width, height) {
    this.id = id;
    this.parent = parent;
    this.width = width;
    this.height = height;
    this.ctx = null;
    // game settings
    this.sprite_size = 32;
  }

  clear() {
    this.ctx.fillStyle = "teal";
    this.ctx.fillRect(0,0, this.width, this.height);
  }

  drawTile(x, y, sprite) {
    this.ctx.drawImage(
      this.sprites,
      // sprite selection
      sprite.x*this.sprite_size, sprite.y*this.sprite_size,
      // sprite size
      this.sprite_size, this.sprite_size,
      // sprite position on canvas
      x*this.sprite_size, y*this.sprite_size,
      // sprite size on canvas
      this.sprite_size, this.sprite_size
    );
  }

  drawSprite(x, y, sprite) {
    this.ctx.drawImage(
      this.sprites,
      // sprite selection
      sprite.x*this.sprite_size, sprite.y*this.sprite_size,
      // sprite size
      this.sprite_size, this.sprite_size,
      // sprite position on canvas
      x, y,
      // sprite size on canvas
      this.sprite_size, this.sprite_size
    );
  }

  drawText(font, color, x, y, text, strokeColor = 'black') {
    this.ctx.strokeStyle = strokeColor;
    this.ctx.fillStyle = color;
    this.ctx.font = font;
    this.ctx.strokeText(text, x+1, y+1);
    this.ctx.fillText(text, x, y);
  }

  drawRectangle(color, x, y, width, heigth) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, heigth);
  }

  create() {
    if(this.ctx !== null) {
      console.log('Canvas already created!');
      return;
    } else {
      let divWrapper = document.createElement('div');
      let canvasElem = document.createElement('canvas');
      this.parent.appendChild(divWrapper);
      divWrapper.appendChild(canvasElem);

      divWrapper.id = this.id;
      canvasElem.width = this.width;
      canvasElem.height = this.height;

      this.ctx = canvasElem.getContext('2d');
      this.sprites = document.getElementById('sprites');
    }
  }
}

export { Canvas };
