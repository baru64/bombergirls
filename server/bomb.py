import logging
import time

logger = logging.getLogger(__name__)


class Bomb:

    def __init__(self, x, y, game):
        self.x = x
        self.y = y
        self.timeout = 1.0
        self.game = game
        self.strength = 2
        self.start_time = time.time()

    def step(self):
        if time.time() - self.start_time > self.timeout:
            self.game.explode_bomb(self)
