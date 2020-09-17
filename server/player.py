import logging

logger = logging.getLogger(__name__)


class Player:

    def __init__(self, id, x, y, color, ws, stats=0):
        self.id = id
        self.x = x
        self.y = y
        self.color = color  # 0 - 3
        self.is_dead = False
        self.stats = stats
        self.ws = ws
        self.nickname = 'mike'

    async def send_message(self, msg):
        logger.info('sending message: {} to player[{}]'.format(msg, self.id))
        try:
            await self.ws.send_bytes(msg.serialize())
        except Exception as e:
            logger.error(e)
        logger.info('message sent')
