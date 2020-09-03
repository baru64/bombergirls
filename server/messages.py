from enum import Enum
from struct import pack, unpack

class UserMessageType(Enum):
    Join        = 1
    Move        = 2
    PlaceBomb   = 3

class ServerMessageType(Enum):
    JoinInfo        = 1
    KickOrReject    = 2
    NewPlayer       = 3
    DelPlayer       = 4
    UpdatePlayer    = 5
    NewBomb         = 6
    ExplodeBomb     = 7
    NewGame         = 8

class UserMessage:

    @staticmethod
    def from_binary(data: bytes) -> dict:
        message = dict()
        message['type'] = data[0]
        if message['type'] == UserMessageType.Join.value:
            message['room_id'] = unpack('!H', data[1:3])
            message['player_nickname'] = data[3:].decode('utf-8')
        elif message['type'] == UserMessageType.Move.value:
            message['direction'] = data[1]
        elif message['type'] == UserMessageType.PlaceBomb.value:
            message['bomb_x'] = data[1]
            message['bomb_y'] = data[2]
        return message

class ServerMessage:

    def __init__(self, type, **kwargs):
        self.type = type
        self.kwargs = kwargs

    def serialize(self) -> bytes:
        data = pack('!B', self.type.value)
        if self.type == ServerMessageType.JoinInfo:
            data += pack('!H', self.kwargs['room_id'])
            data += pack('!H', self.kwargs['player_id'])
            data += pack('!H', self.kwargs['player_x'])
            data += pack('!H', self.kwargs['player_y'])
            data += pack('!B', self.kwargs['player_stats'])
            data += pack('!B', self.kwargs['player_color'])
            data += pack('!B', self.kwargs['is_player_dead'])
            data += pack('!B', self.kwargs['time_left'])
        elif self.type == ServerMessageType.NewPlayer:
            data += pack('!H', self.kwargs['player_id'])
            data += pack('!H', self.kwargs['player_x'])
            data += pack('!H', self.kwargs['player_y'])
            data += pack('!B', self.kwargs['player_stats'])
            data += pack('!B', self.kwargs['player_color'])
            data += pack('!B', self.kwargs['is_player_dead'])
            data += self.kwargs['player_nickname'].encode('utf-8')
        elif self.type == ServerMessageType.DelPlayer:
            data += pack('!H', self.kwargs['player_id'])
        elif self.type == ServerMessageType.UpdatePlayer:
            data += pack('!H', self.kwargs['player_id'])
            data += pack('!H', self.kwargs['player_x'])
            data += pack('!H', self.kwargs['player_y'])
            data += pack('!B', self.kwargs['player_stats'])
            data += pack('!B', self.kwargs['is_player_dead'])
        elif self.type == ServerMessageType.NewBomb:
            data += pack('!B', self.kwargs['bomb_x'])
            data += pack('!B', self.kwargs['bomb_y'])
        elif self.type == ServerMessageType.ExplodeBomb:
            data += pack('!B', self.kwargs['bomb_x'])
            data += pack('!B', self.kwargs['bomb_y'])
        elif self.type == ServerMessageType.NewGame:
            data += pack('!B', self.kwargs['time_left'])
        print(f'- sending: {data}')
        return data
