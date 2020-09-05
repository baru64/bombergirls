from enum import Enum
import asyncio
from aiohttp import web, WSMsgType

from server.game import Game
from server.messages import (
    UserMessageParser,
    UserMessageType,
    ServerMessage,
    ServerMessageType
)

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
        self.ws = ws
        self.state = SessionState.NotJoined
        self.player = None
        self.game = None


ROOMS = {} # room_id: game instance

# TODO: preserve state

async def websocket_handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    sess = Session(ws)
    user_parser = UserMessageParser()
    print('>websocket opened')
    async for msg in ws:
        print('>msg received')
        if msg.type == WSMsgType.TEXT:
            # we shouldn't get those
            print(msg.data)
        elif msg.type == WSMsgType.BINARY:
            print('- recvd:', msg.data.hex())
            usermsg = user_parser.from_binary(msg.data)
            if (sess.state == SessionState.NotJoined and
                usermsg['type'] == UserMessageType.Join):
                if usermsg['room_id'] in ROOMS:
                    sess.player = ROOM[usermsg['room_id']].add_player()
                    user_parser.player = sess.player
                    sess.game = ROOM[usermsg['room_id']]
                    sess.state = SessionState.Joined
                else:
                    game = Game()
                    sess.player = game.add_player(ws)
                    user_parser.player = sess.player
                    ROOM[usermsg['room_id']] = game
                    sess.game = game
                    sess.state = SessionState.Joined
            elif sess.state == SessionState.Joined:
               sess.game.received_messages.append(usermsg)

        elif msg.type == WSMsgType.ERROR:
            print("error: {}".format(ws.exception()))
    print(">websocket closed")
    return ws

async def gameserver_loop():
    while True:
        for game in ROOMS.values():
            game.get_inputs()
            game.step()
            game.update_players()
        await asyncio.sleep(0.05)


app = web.Application()
app.add_routes([web.get('/ws', websocket_handler)])

if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    task = loop.create_task(gameserver_loop())
    gameserver = loop.run_until_complete(task)
    web.run_app(app)
