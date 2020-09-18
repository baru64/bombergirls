import math
import time
import logging
from typing import List
from collections import deque

from aiohttp.web import WebSocketResponse

from .map import GameMap, Tile
from .bomb import Bomb
from .messages import ServerMessage, ServerMessageType, UserMessageType
from .player import Player

logger = logging.getLogger(__name__)


class Game:

    def __init__(self):
        self.players: List[Player] = []
        self.map: GameMap = GameMap()
        self.bombs: List[Bomb] = []
        self.received_messages: deque = deque()
        self.messages_to_send: deque = deque()
        self.player_move_size: int = 16
        self.counter: int = 0
        self.start_time: float = time.time()
        self.round_length: int = 90  # 90 seconds

    def step(self):
        for bomb in self.bombs:
            bomb.step()
        if time.time() - self.start_time > self.round_length:
            logger.info('round timeout')
            self.new_game()

    def move_player(self, player: Player, direction: int):
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
        if (x < 32 or x > (self.map.size[0]-2)*32
                or y < 32 or y > (self.map.size[1]-2)*32):
            return
        # collision with inner blocks
        if ((x-32) % 64 < 32+32 and (x-32) % 64+32 > 32 and
           (y-32) % 64 < 32+32 and (y-32) % 64+32 > 32):
            return
        # collision with walls
        tile_x = math.ceil(x / 32)
        tile_y = math.ceil(y / 32)
        if self.map.tiles[tile_y*self.map.size[0]+tile_x] != Tile.Empty:
            return
        # move
        player.x = x
        player.y = y

    def add_bomb(self, x: int, y: int):
        # TODO check if there is no wall
        for bomb in self.bombs:
            if bomb.x == x and bomb.y == y:
                return
        new_bomb = Bomb(x, y, self)
        self.bombs.append(new_bomb)
        msg = ServerMessage(
            type=ServerMessageType.NewBomb,
            bomb_x=x,
            bomb_y=y
        )
        self.messages_to_send.append(msg)

    def explode_bomb(self, bomb: Bomb):
        # destroy walls and kill players
        # up
        for i in range(bomb.strength+1):
            if (self.map.tiles[(bomb.y-i)*self.map.size[0]+bomb.x]
                    == Tile.Empty):
                for player in self.players:
                    if (math.ceil(player.x/32) == bomb.x and
                            math.ceil(player.y/32) == bomb.y-i):
                        player.is_dead = True
            elif (self.map.tiles[(bomb.y-i)*self.map.size[0]+bomb.x]
                  == Tile.Wall):
                self.map.tiles[(bomb.y-i)*self.map.size[0]+bomb.x] = Tile.Empty
                break
            elif (self.map.tiles[(bomb.y-i)*self.map.size[0]+bomb.x]
                  == Tile.Block):
                break
        # down
        for i in range(bomb.strength):
            if (self.map.tiles[(bomb.y+i)*self.map.size[0]+bomb.x]
                    == Tile.Empty):
                for player in self.players:
                    if (math.ceil(player.x/32) == bomb.x and
                            math.ceil(player.y/32) == bomb.y+i):
                        player.is_dead = True
            elif (self.map.tiles[(bomb.y+i)*self.map.size[0]+bomb.x]
                  == Tile.Wall):
                self.map.tiles[(bomb.y+i)*self.map.size[0]+bomb.x] = Tile.Empty
                break
            elif (self.map.tiles[(bomb.y+i)*self.map.size[0]+bomb.x]
                  == Tile.Block):
                break
        # left
        for i in range(bomb.strength+1):
            if self.map.tiles[bomb.y*self.map.size[0]+bomb.x-i] == Tile.Empty:
                for player in self.players:
                    if (math.ceil(player.x/32) == bomb.x-i and
                            math.ceil(player.y/32) == bomb.y):
                        player.is_dead = True
            elif self.map.tiles[bomb.y*self.map.size[0]+bomb.x-i] == Tile.Wall:
                self.map.tiles[bomb.y*self.map.size[0]+bomb.x-i] = Tile.Empty
                break
            elif (self.map.tiles[bomb.y*self.map.size[0]+bomb.x-i]
                  == Tile.Block):
                break
        # right
        for i in range(bomb.strength+1):
            if self.map.tiles[bomb.y*self.map.size[0]+bomb.x+i] == Tile.Empty:
                for player in self.players:
                    if (math.ceil(player.x/32) == bomb.x+i and
                            math.ceil(player.y/32) == bomb.y):
                        player.is_dead = True
            elif self.map.tiles[bomb.y*self.map.size[0]+bomb.x+i] == Tile.Wall:
                self.map.tiles[bomb.y*self.map.size[0]+bomb.x+i] = Tile.Empty
                break
            elif (self.map.tiles[bomb.y*self.map.size[0]+bomb.x+i]
                  == Tile.Block):
                break
        explode_msg = ServerMessage(
            type=ServerMessageType.ExplodeBomb,
            bomb_x=bomb.x,
            bomb_y=bomb.y
        )
        self.bombs.remove(bomb)
        self.messages_to_send.append(explode_msg)
        # check players left
        players_alive = 0
        if len(self.players) == 1 and self.players[0].is_dead:
            self.new_game()
        elif len(self.players) > 1:
            for player in self.players:
                if not player.is_dead:
                    players_alive += 1
            if players_alive == 1:
                for player in self.players:
                    if not player.is_dead:
                        player.stats += 1
                        self.new_game()
            elif players_alive == 0:
                self.new_game()

    def remove_player(self, player: Player):
        # remove player and add message
        del_player = ServerMessage(
            type=ServerMessageType.DelPlayer,
            player_id=player.id
        )
        self.players.remove(player)
        self.messages_to_send.append(del_player)

    def add_player(self, ws: WebSocketResponse, nickname: str) -> Player:
        starting_pos = [
            (32, 32),
            (32*(self.map.size[0]-2), 32),
            (32, 32*(self.map.size[1]-2)),
            (32*(self.map.size[0]-2), 32*(self.map.size[1]-2))
        ]
        px, py = starting_pos[len(self.players)]
        player = Player(self.counter, px, py, len(self.players), ws, stats=0)
        player.nickname = nickname
        if len(self.players) > 1:
            player.is_dead = True
        self.counter += 1
        new_player = ServerMessage(
            type=ServerMessageType.NewPlayer,
            player_id=player.id,
            player_x=player.x,
            player_y=player.y,
            player_stats=player.stats,
            player_color=player.color,
            is_player_dead=player.is_dead,
            player_nickname=player.nickname
        )
        logger.info(f'add new player[{player.id}] pos: {player.x} {player.y}')
        self.messages_to_send.append(new_player)
        self.players.append(player)
        return player

    def new_game(self):
        # set new starting positions
        logger.info('starting new game')
        starting_pos = [
            (32, 32),
            (32*(self.map.size[0]-2), 32),
            (32, 32*(self.map.size[1]-2)),
            (32*(self.map.size[0]-2), 32*(self.map.size[1]-2))
        ]
        for idx, player in enumerate(self.players):
            player.x, player.y = starting_pos[idx]
            player.is_dead = False
        # reset map and send newgame
        self.map = GameMap()
        new_game_msg = ServerMessage(
            type=ServerMessageType.NewGame,
            time_left=self.round_length
        )
        self.messages_to_send.append(new_game_msg)
        # reset timer
        self.start_time = time.time()
        # reset bombs
        self.bombs = []

    async def update_players(self):
        # send messages to players
        while self.messages_to_send:
            message = self.messages_to_send.popleft()
            for player in self.players:
                await player.send_message(message)
        # update player state
        for player in self.players:
            update_msg = ServerMessage(
                type=ServerMessageType.UpdatePlayer,
                player_id=player.id,
                player_x=player.x,
                player_y=player.y,
                player_stats=player.stats,
                is_player_dead=player.is_dead
            )
            for dest_player in self.players:
                await dest_player.send_message(update_msg)

    def get_inputs(self):
        # parse all received messages and apply changes
        logger.info('get_inputs')
        while self.received_messages:
            logger.info('received user input')
            msg = self.received_messages.popleft()
            if msg['type'] == UserMessageType.Move:
                logger.info(f'received move message: {msg}')
                self.move_player(msg['player'], msg['direction'])
            elif msg['type'] == UserMessageType.PlaceBomb:
                logger.info(f'received new bomb message: {msg}')
                self.add_bomb(msg['bomb_x'], msg['bomb_y'])
