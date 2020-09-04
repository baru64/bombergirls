class Bomb:

    def __init__(self, x, y, game):
        self.x = x
        self.y = y
        self.timeout = 60
        self.game = game

    def step():
        self.timeout -= timeout
        if self.timeout == 0:
            self.game.explode_bomb(this, x, y)
