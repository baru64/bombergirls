import logging

logger = logging.getLogger(__name__)


class Bomb:

    def __init__(self, x, y, game):
        self.x = x
        self.y = y
        self.timeout = 25
        self.game = game
        self.strength = 2

    def step(self):
        self.timeout = self.timeout - 1
        if self.timeout == 0:
            self.game.explode_bomb(self)
