from enum import Enum

class Tile(Enum):
    Empty = 0
    Block = 1
    Wall = 2

class GameMap:

    def __init__(self, x=15, y=13, tile_size=32):
        self.size = (x, y)
        self.tile_size = tile_size
        self.tiles = []
        self._gen_tiles()

    def _gen_tiles(self):
        for j in range(self.size[1]):
            for i in range(self.size[0]):
                if (0 in (j, i) or i == self.size[0]-1 or j == self.size[1]-1 or
                    ((i % 2 == 0) and (j % 2 == 0))):
                    self.tiles.append(Tile.Block)
                elif not ((i < 3 or i > self.size[0]-4) and
                          (j < 3 or j > self.size[1]-4)):
                     self.tiles.append(Tile.Wall)
                else:
                    self.tiles.append(Tile.Empty)

if __name__ == '__main__':
    map = GameMap()
    for y in range(map.size[1]):
        for x in range(map.size[0]):
            print(map.tiles[y*map.size[0]+x].value, end='')
        print()
