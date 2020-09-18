from enum import Enum
import asyncio
import logging
import sys
import time

from aiohttp import web, WSMsgType

from server.game import Game
from server.player import Player
from server.messages import (
    UserMessageParser,
    UserMessageType,
    ServerMessage,
    ServerMessageType
)

logger = logging.getLogger(__name__)

# > user sends join
# > server creates new game and adds new player(socket) to it,
# or adds to existing game
# > game sends joininfo to user
# > game sends other players to user
# > game sends newgame when new round starts and sends other players
# > game sends explodes, position updates and isdead when players are killed
# during a game
# > when last player leaves game it is destroyed


class SessionState(Enum):
    NotJoined = 1
    Joined = 2


class Session:

    def __init__(self, ws):
        self.ws: web.WebSocketResponse = ws
        self.state: SessionState = SessionState.NotJoined
        self.player: Player = None
        self.game: Game = None


ROOMS = {}  # room_id: game instance

# TODO: preserve state


async def websocket_handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    sess = Session(ws)
    user_parser = UserMessageParser()
    # test player
    # sess.player = Player(1, 32, 32, 1, ws, stats=0)
    logger.info('websocket opened')
    async for msg in ws:
        logger.info('msg received')
        if msg.type == WSMsgType.TEXT:
            # we shouldn't get those
            logger.info(msg.data)
        elif msg.type == WSMsgType.BINARY:
            logger.info(f'recvd:{msg.data.hex()}')
            usermsg = user_parser.from_binary(msg.data)
            if (sess.state == SessionState.NotJoined and
                    usermsg['type'] == UserMessageType.Join):
                if usermsg['room_id'] in ROOMS:
                    sess.player = ROOMS[usermsg['room_id']].add_player(ws)
                    sess.player.nickname = usermsg['player_nickname']
                    user_parser.player = sess.player
                    sess.game = ROOMS[usermsg['room_id']]
                    sess.state = SessionState.Joined
                else:
                    game = Game()
                    sess.player = game.add_player(ws)
                    sess.player.nickname = usermsg['player_nickname']
                    user_parser.player = sess.player
                    ROOMS[usermsg['room_id']] = game
                    sess.game = game
                    sess.state = SessionState.Joined
                # send joininfo
                logger.info(f"user joined room id: {usermsg['room_id']}")
                joininfo = ServerMessage(
                    type=ServerMessageType.JoinInfo,
                    room_id=usermsg['room_id'],
                    player_id=sess.player.id,
                    player_x=sess.player.x,
                    player_y=sess.player.y,
                    player_stats=sess.player.stats,
                    player_color=sess.player.color,
                    is_player_dead=sess.player.is_dead,
                    time_left=int(sess.game.round_length
                                  - (time.time() - sess.game.start_time))
                )
                await sess.player.send_message(joininfo)
                if len(sess.game.players) > 1:
                    # add existing players to new players context
                    logger.info('synchronize players')
                    for another_player in sess.game.players:
                        if another_player is not sess.player:
                            logger.info(f'sync p{another_player.id}'
                                        f' -> p{sess.player.id}')
                            sync_player_msg = ServerMessage(
                                type=ServerMessageType.NewPlayer,
                                player_id=another_player.id,
                                player_x=another_player.x,
                                player_y=another_player.y,
                                player_stats=another_player.stats,
                                player_color=another_player.color,
                                is_player_dead=another_player.is_dead,
                                player_nickname=another_player.nickname
                            )
                            await sess.player.send_message(sync_player_msg)
            elif sess.state == SessionState.Joined:
                logger.info('received new message from joined player')
                sess.game.received_messages.append(usermsg)

        elif msg.type == WSMsgType.ERROR:
            logger.error("error: {}".format(ws.exception()))
    logger.info("websocket closed")
    sess.player.disconnected = True
    # TODO delPlayer?
    # set player to disconected, if disconected until new_game delete
    return ws


async def start_background_tasks(app):
    app['gameserver'] = app.loop.create_task(gameserver_loop())


async def gameserver_loop():
    logger.info('starting gameserver loop')
    while True:
        for game in ROOMS.values():
            game.get_inputs()
            game.step()
            await game.update_players()
        await asyncio.sleep(0.05)


app = web.Application()
app.add_routes([web.get('/ws', websocket_handler)])

if __name__ == '__main__':
    logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)
    logger.info('starting server')
    app.on_startup.append(start_background_tasks)
    web.run_app(app)
