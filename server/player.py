import logging
import random

from aiohttp.web import WebSocketResponse

from .messages import ServerMessage

logger = logging.getLogger(__name__)


class Player:

    def __init__(self, id: int, x: int, y: int, color: int,
                 ws: WebSocketResponse, stats: int = 0):
        self.id = id
        self.x = x
        self.y = y
        self.color = color  # 0 - 3
        self.is_dead = False
        self.stats = stats
        self.ws = ws
        self.nickname = 'mike'
        self.disconnected = False
        self.code = random.randint(1, 4000000000)

    async def send_message(self, msg: ServerMessage):
        if self.disconnected:
            logger.info(f'attempt to send to disconnected player[{self.id}]')
            return
        logger.info('sending message: {} to player[{}]'.format(msg, self.id))
        try:
            await self.ws.send_bytes(msg.serialize())
        except Exception as e:
            logger.error(e)
        logger.info('message sent')
