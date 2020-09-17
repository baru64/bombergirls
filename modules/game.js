import { GameMap, TileType } from './map.js';
import { Bomb } from './bomb.js';
import { ExplosionEffect, BurnedWallEffect } from './effects.js';
import {
  UserMoveMessage,
  UserPlaceBombMessage,
  ServerMessageType
} from './synchronizer.js';
import { GameState } from './user.js';
import { Player } from './player.js';

class Game {
  constructor(players, sync, user) {
    this.map = new GameMap();
    this.players = players;
    this.sync = sync;
    this.user = user;
    this.players.forEach((player) => {
      player.game = this;
    });
    this.bombs = new Array();
    this.effects = new Array();
    this.time_left = 0; // TODO how to measure time
  }

  render(screen) {
    this.map.draw(screen);
    this.bombs.forEach((bomb) => {
      bomb.draw(screen);
    });
    this.players.forEach((player) => {
      player.draw(screen);
    });
    this.effects.forEach((effect) => {
      effect.draw(screen);
    });
  }

  movePlayer(player, x, y, direction) {
    // TODO change hardcoded 32 with tile size
    // collison with border blocks
    if (x < 32 || x > (this.map.size.x-2)*32
        || y < 32 || y > (this.map.size.y-2)*32) {
      return false;
    }
    // collision with inner blocks
    if ((x-32)%64 < 32+32 &&
        (x-32)%64+32 > 32 &&
        (y-32)%64 < 32+32 &&
        (y-32)%64+32 > 32) return false;
    // collision with walls
    // TODO FIX THIS
    let tile_x = Math.ceil(x / 32);
    let tile_y = Math.ceil(y / 32);
    let tile = this.map.tiles.get(tile_y*this.map.size.x+tile_x);
    if (tile !== undefined && tile.type == TileType.Wall) return false;
    // send message to server
    let msg = new UserMoveMessage(direction);
    console.log('movePlayer: sendMessage');
    this.sync.sendMessage(msg);
    return true;
  }

  // NOTES: addBomb and explosion, check how bombs look like
  // and implement server then

  addBomb(x, y) {
    // calculate coordinates in grid under player
    // add new Bomb to bomb array
    let tile_x = Math.floor(x / 32);
    let tile_y = Math.floor(y / 32);
    // when server will be ready move code below to updateState
    // let bomb = new Bomb(tile_x, tile_y, this);
    // this.bombs.push(bomb);
    // send message to server
    let msg = new UserPlaceBombMessage(tile_x, tile_y);
    this.sync.sendMessage(msg);
  }

  explosion(bomb, x, y) {
    // delete bomb from array
    // add explosion effect, burning walls are a part of animation
    let index = this.bombs.indexOf(bomb);
    this.bombs.splice(index, 1);
    let explosionEffect = new ExplosionEffect(x, y, this);
    this.effects.push(explosionEffect);
    // kill hit players - synchronizer will tell us to do it anyway
  }

  destroyWalls(walls) {
    // walls - array of tile keys
    for (let i=0; i < walls.length;++i) {
      let wall = this.map.tiles.get(walls[i]);
      let burnedWallEffect = new BurnedWallEffect(wall.x, wall.y, this);
      this.effects.push(burnedWallEffect);
      this.map.tiles.delete(walls[i]);
    }
  }

  effectExpired(effect) {
    let index = this.effects.indexOf(effect);
    this.effects.splice(index, 1);
  }

  updateState() {
    // recvMessage until empty
    // apply state changes
    while(this.sync.messagesInQueue()) {
      let message = this.sync.recvMessage();
      switch (message.type) {
        case ServerMessageType.JoinInfo:
          this.user.room_id = message.room_id;
          this.user.player.id = message.player_id;
          this.user.player.x = message.player_x;
          this.user.player.y = message.player_y;
          this.user.player.stats = message.player_stats;
          this.user.player.color = message.player_color;
          this.user.player.isDead = message.is_player_dead;
          break;
        case ServerMessageType.KickOrReject:
          // TODO change user state
          this.user.state = GameState.inMainMenu;
          break;
        case ServerMessageType.NewPlayer:
          console.log('received new player id:' + message.player_id);
          console.log('users player id: ' + this.user.player.id);
          if (message.player_id == this.user.player.id) break;
          let newPlayer = new Player(
            message.player_id,
            message.player_x,
            message.player_y,
            message.player_color
          );
          newPlayer.stats = message.player_stats;
          newPlayer.isDead = (message.is_player_dead == 1);
          newPlayer.nickname = message.player_nickname;
          newPlayer.game = this;
          this.players.push(newPlayer);
          break;
        case ServerMessageType.DelPlayer:
          let index = this.players.findIndex(p => p.id == message.player_id);
          this.players.splice(index, 1);
          break;
        case ServerMessageType.UpdatePlayer:
          let player = this.players.find(p => p.id == message.player_id);
          player.id = message.player_id;
          player.x = message.player_x;
          player.y = message.player_y;
          player.stats = message.player_stats;
          player.isDead = (message.is_player_dead == 1);
          break;
        case ServerMessageType.NewBomb:
          let new_bomb = new Bomb(message.bomb_x, message.bomb_y, this);
          this.bombs.push(new_bomb);
          break;
        case ServerMessageType.ExplodeBomb:
          let bomb = this.bombs.find(
            bomb => bomb.x == message.bomb_x && bomb.y == message.bomb_y
          );
          this.explosion(bomb, message.bomb_x, message.bomb_y);
          break;
        case ServerMessageType.NewGame:
          // new map
          this.map = new GameMap();
          this.time_left = message.time_left;
          break;
      }
    }
  }
}

export { Game };
