from aiohttp import web, WSMsgType
from server.messages import UserMessage, ServerMessage, ServerMessageType

# > user sends join
# > server creates new game and adds new player(socket) to it,
# or adds to existing game
# > game sends joininfo to user
# > game sends other players to user
# > game sends newgame when new round starts and sends other players
# > game sends explodes, position updates and isdead when players are killed
# during a game
# > when last player leaves game it is destroyed

ROOMS = {} # room_id: game instance

# TODO: creating new game and joining players
# TODO: preserve state

async def websocket_handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    print('>websocket opened')
    newplayer = ServerMessage(
        type=ServerMessageType.NewPlayer,
        player_id=1234,
        player_x=64,
        player_y=32,
        player_stats=0,
        player_color=1,
        is_player_dead=0,
        player_nickname='mike'
    )
    await ws.send_bytes(newplayer.serialize())
    async for msg in ws:
        print('>msg received')
        if msg.type == WSMsgType.TEXT:
            print(msg.data)
        elif msg.type == WSMsgType.BINARY:
            print('- recvd:', msg.data.hex())
            mesedz = UserMessage.from_binary(msg.data)
            print(mesedz)
            print('sending them komends')
            servmsg = ServerMessage(
                type=ServerMessageType.NewBomb,
                bomb_x=1,
                bomb_y=1
            )
            await ws.send_bytes(servmsg.serialize())
            servmsg = ServerMessage(
                type=ServerMessageType.UpdatePlayer,
                player_id=1234,
                player_x=72,
                player_y=32,
                player_stats=0,
                is_player_dead=0
            )
            await ws.send_bytes(servmsg.serialize())
        elif msg.type == WSMsgType.ERROR:
            print("error: {}".format(ws.exception()))
    print(">websocket closed")
    return ws

app = web.Application()
app.add_routes([web.get('/ws', websocket_handler)])

if __name__ == '__main__':
    web.run_app(app)
