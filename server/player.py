class Player:

    def __init__(self, id, x, y, color, ws, stats=0):
        self.id = id
        self.x = x
        self.y = y
        self.color = color # 0 - 3
        self.is_dead = False
        self.stats = stats
        self.ws = ws
        self.nickname = 'mike'

    async def send_message(self, msg):
        await self.ws.send_bytes(msg.serialize())
        print('message sent')
