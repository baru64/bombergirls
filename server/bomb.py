class Bomb:

    def __init__(self, x, y, game):
        self.x = x
        self.y = y
        self.timeout = 60
        self.game = game
        self.strength = 2

    def step(self):
        self.timeout -= self.timeout
        if self.timeout == 0:
            self.game.explode_bomb(self)
