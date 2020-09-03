from enum import Enum

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
    def from_binary(data):
        pass

class ServerMessage:

    def __init__(self, type, **kwargs):
        self.type = type
        self.kwargs = kwargs

    def serialize(self):
        if self.type == ServerMessageType.JoinInfo:
            
        elif self.type == ServerMessageType.KickOrReject:

        elif self.type == ServerMessageType.NewPlayer:

        elif self.type == ServerMessageType.DelPlayer:

        elif self.type == ServerMessageType.UpdatePlayer:

        elif self.type == ServerMessageType.NewBomb:

        elif self.type == ServerMessageType.ExplodeBomb:

        elif self.type == ServerMessageType.NewGame:

        pass
