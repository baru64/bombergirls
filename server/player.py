class Player:

    def __init__(id, x, y, color, ws, stats=0):
        self.id = id
        self.x = x
        self.y = y
        self.color = color # 0 - 3
        self.is_dead = False
        self.stats = stats
        self.ws = ws

    async def send_message(self, msg):
        await ws.send_bytes(msg.serialize())
