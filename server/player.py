class Player:

    def __init__(id, x, y, color, stats=0):
        self.id = id
        self.x = x
        self.y = y
        self.color = color # 0 - 3
        self.is_dead = false
        self.stats = stats
