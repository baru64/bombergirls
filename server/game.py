import math

from .map import GameMap, Tile
from .bomb import Bomb
from .messages import ServerMessage, ServerMessageType
from .player import Player

class Game:

    def __init__(self):
        self.players = []
        self.map = GameMap()
        self.bombs = []
        self.received_messages = []
        self.messages_to_send = []
        self.player_move_size = 16
        self.counter = 0

    def step():
        for bomb in self.bombs:
            bomb.step()

    def move_player(self, player, direction):
        x, y = player.x, player.y
        if direction == 1:
            y -= self.player_move_size
        elif direction == 2:
            x += self.player_move_size
        elif direction == 3:
            y += self.player_move_size
        elif direction == 4:
            x -= self.player_move_size
        # collision with border blocks
        if (x < 32 || x > (self.map.size[0]-2)*32
            || y < 32 || y > (self.map.size[1]-2)*32):
            return
        # collision with inner blocks
        if ((x-32)%64 < 32+32 && (x-32)%64+32 > 32 &&
           (y-32)%64 < 32+32 && (y-32)%64+32 > 32):
            return
        # collision with walls
        tile_x = math.ceil(x / 32)
        tile_y = math.ceil(y / 32)
        if self.map.tiles[tile_y*map.size[0]+tile_x] != Tile.Empty:
            return
        # move
        player.x = x
        player.y = y


    def add_bomb(self, x, y):
        # TODO check if there is no wall
        for bomb in bombs:
            if bomb.x == x and bomb.y == y:
                return
        bomb = Bomb(x, y, self)
        self.bombs.append(bomb)
        msg = ServerMessage(
            type=ServerMessageType.NewBomb,
            bomb_x=x,
            bomb_y=y
        )
        self.messages_to_send.append(msg)

    def explode_bomb(self, bomb):
        # destroy walls and kill players
        # up
        for i in range(bomb.strength+1):
            if map.tiles[(bomb.y-i)*self.map.size[0]+bomb.x] == Tile.Empty:
                for player in self.players:
                    if (math.ceil(player.x/32) == bomb.x and
                        math.ceil(player.y/32) == bomb.y-i):
                       player.is_dead = True
            elif map.tiles[(bomb.y-i)*self.map.size[0]+bomb.x] == Tile.Wall:
                 map.tiles[(bomb.y-i)*self.map.size[0]+bomb.x] = Tile.Empty
                 break
            elif map.tiles[(bomb.y-i)*self.map.size[0]+bomb.x] == Tile.Block:
                break
        # down
        for i in range(bomb.strength):
            if map.tiles[(bomb.y+i)*self.map.size[0]+bomb.x] == Tile.Empty:
                for player in self.players:
                    if (math.ceil(player.x/32) == bomb.x and
                        math.ceil(player.y/32) == bomb.y+i):
                       player.is_dead = True
            elif map.tiles[(bomb.y+i)*self.map.size[0]+bomb.x] == Tile.Wall:
                 map.tiles[(bomb.y+i)*self.map.size[0]+bomb.x] = Tile.Empty
                 break
            elif map.tiles[(bomb.y+i)*self.map.size[0]+bomb.x] == Tile.Block:
                break
        # left
        for i in range(bomb.strength+1):
            if map.tiles[bomb.y*self.map.size[0]+bomb.x-i] == Tile.Empty:
                for player in self.players:
                    if (math.ceil(player.x/32) == bomb.x-i and
                        math.ceil(player.y/32) == bomb.y):
                       player.is_dead = True
            elif map.tiles[bomb.y*self.map.size[0]+bomb.x-i] == Tile.Wall:
                 map.tiles[bomb.y*self.map.size[0]+bomb.x-i] = Tile.Empty
                 break
            elif map.tiles[bomb.y*self.map.size[0]+bomb.x-i] == Tile.Block:
                break
        # right
        for i in range(bomb.strength+1):
            if map.tiles[bomb.y*self.map.size[0]+bomb.x+i] == Tile.Empty:
                for player in self.players:
                    if (math.ceil(player.x/32) == bomb.x+i and
                        math.ceil(player.y/32) == bomb.y):
                       player.is_dead = True
            elif map.tiles[bomb.y*self.map.size[0]+bomb.x+i] == Tile.Wall:
                 map.tiles[bomb.y*self.map.size[0]+bomb.x+i] = Tile.Empty
                 break
            elif map.tiles[bomb.y*self.map.size[0]+bomb.x+i] == Tile.Block:
                break
        explode_msg = ServerMessage(
            type=ServerMessageType.ExplodeBomb,
            bomb_x=bomb.x,
            bomb_y=bomb.y
        )
        self.bombs.remove(bomb)
        self.messages_to_send.append(explode_msg)

    def remove_player(self, id):
        # remove player and add message
        player = None
        for p in players:
            if p.id == id:
                player = p
                break
        players.remove(player)
        del_player = ServerMessage(
            type=ServerMessageType.DelPlayer,
            player_id=id
        )
        self.messages_to_send.append(del_player)


    def add_player(self):
        starting_pos = [
            (32,32),
            (32*(self.map.size[0]-2),32),
            (32, 32*(self.map.size[1]-2)),
            (32*(self.map.size[0]-2), 32*(self.map.size[1]-2))
        ]
        px, py = starting_pos[len(self.players)]
        player = Player(self.counter, px, py, len(self.players)+1, 0)
        self.counter += 1
        new_player = ServerMessage(
            type=ServerMessageType.NewPlayer,
            player_id=self.counter,
            player_x=64,
            player_y=32,
            player_stats=0,
            player_color=1,
            is_player_dead=0,
            player_nickname='mike'
        )
        self.messages_to_send.append(new_player)
        self.players.append(player)
        return player

    def new_game(self):
        # set new starting positions
        # reset map and send newgame
        pass

    def update_players(self):
        # send messages to players
        pass


    def get_inputs(self):
        # parse all received messages and apply changes
        pass
