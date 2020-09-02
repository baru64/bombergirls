from aiohttp import web, WSMsgType

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

async def websocket_handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    print('>websocket opened')
    async for msg in ws:
        print('>msg received')
        if msg.type == WSMsgType.TEXT:
            print(msg.data)
        elif msg.type == WSMsgType.BINARY:
            print(msg.data.hex())
        elif msg.type == WSMsgType.ERROR:
            print("error: {}".format(ws.exception()))
    print(">websocket closed")
    return ws

app = web.Application()
app.add_routes([web.get('/ws', websocket_handler)])

if __name__ == '__main__':
    web.run_app(app)
