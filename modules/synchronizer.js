const UserMessageType = {
  Join: 1,     // room id, nickname
  Move: 2,     // direction
  PlaceBomb: 3 // x, y
}

const ServerMessageType = {
  JoinInfo: 1,      // room id, player id, isPlayerDead, time
  KickOrReject: 2,
  NewPlayer: 3,     // id, position, isdead, stats
  DelPlayer: 4,     // id
  UpdatePlayer: 5,  // position, isdead, stats
  NewBomb: 6,       // bomb position
  ExplodeBomb: 7,   // bomb position
  NewGame: 8,
}

class UserJoinMessage {
  constructor(room_id, nickname) {
    this.type = UserMessageType.Join;
    this.room_id = room_id;
    this.nickname = nickname; // maxlen: 16
  }
  serialize() {
    const buffer = new ArrayBuffer(3);
    const view = new DataView(buffer);
    view.setUint8(0, this.type);
    view.setUint16(1, this.room_id);
    const encoder = new TextEncoder();
    const encoded_nickname = encoder.encode(this.nickname);
    const data = new Uint8Array(3+16);
    data.set(new Uint8Array(buffer), 0);
    data.set(new Uint8Array(encoded_nickname), 3);
    return data.buffer;
  }
}

class UserMoveMessage {
  constructor(direction) {
    this.type = UserMessageType.Move;
    switch(direction) {
      case 'up': this.direction = 1; break;
      case 'right': this.direction = 2; break;
      case 'down': this.direction = 3; break;
      case 'left': this.direction = 4; break;
    }
  }
  serialize() {
    const buffer = new ArrayBuffer(2);
    const view = new DataView(buffer);
    view.setUint8(0, this.type);
    view.setUint8(1, this.direction);
    return buffer;
  }
}

class UserPlaceBombMessage {
  constructor(x, y) {
    this.type = UserMessageType.PlaceBomb;
    this.x = x;
    this.y = y;
  }
  serialize() {
    const buffer = new ArrayBuffer(5);
    const view = new DataView(buffer);
    view.setUint8(0, this.type);
    view.setUint8(1, this.x);
    view.setUint8(2, this.y);
    return buffer;
  }
}

class ServerMessage {
  constructor(data) {
    this.fromBinary(data);
  }

  fromBinary(data) {
    const view = new DataView(data);
    this.type = view.getUint8(0);
    switch (this.type) {
      case ServerMessageType.JoinInfo:
        this.room_id = view.getUint16(1);
        this.player_id = view.getUint16(3);
        this.player_x = view.getUint16(5);
        this.player_y = view.getUint16(7);
        this.player_stats = view.getUint8(9);
        this.player_color = view.getUint8(10);
        // player is dead when joins during game or joins first
        this.is_player_dead = view.getUint8(11);
        this.time_left = view.getUint8(12);
        break;
      case ServerMessageType.KickOrReject:
        // no info, just reject join or kick from room
        break;
      case ServerMessageType.NewPlayer:
        this.player_id = view.getUint16(1);
        this.player_x = view.getUint16(3);
        this.player_y = view.getUint16(5);
        this.player_stats = view.getUint8(7);
        this.player_color = view.getUint8(8);
        this.is_player_dead = view.getUint8(9);
        let nickname_buffer = new Uint8Array(data.slice(10,26));
        let text_decoder = new TextDecoder();
        this.player_nickname = text_decoder.decode(nickname_buffer);
        break;
      case ServerMessageType.DelPlayer:
        this.player_id = view.getUint16(1);
        break;
      case ServerMessageType.UpdatePlayer:
        this.player_id = view.getUint16(1);
        this.player_x = view.getUint16(3);
        this.player_y = view.getUint16(5);
        this.player_stats = view.getUint8(7);
        this.is_player_dead = view.getUint8(8);
        break;
      case ServerMessageType.NewBomb:
        this.bomb_x = view.getUint8(1); // tile position
        this.bomb_y = view.getUint8(2);
        break;
      case ServerMessageType.ExplodeBomb:
        this.bomb_x = view.getUint8(1); // tile position
        this.bomb_y = view.getUint8(2);
        break;
      case ServerMessageType.NewGame:
        // newplayer/updateplayer messages will follow this
        this.time_left = view.getUint8(1);
        break;
      default:
        // something went wrong
        this.type = 0;
    }
  }
}

//code.iamkate.com
function Queue() {
  var queue  = [];
  var offset = 0;
  this.getLength = function(){
    return (queue.length - offset);
  }
  this.isEmpty = function(){
    return (queue.length == 0);
  }
  this.enqueue = function(item){
    queue.push(item);
  }
  this.dequeue = function(){
    if (queue.length == 0) return undefined;
    var item = queue[offset];
    if (++ offset * 2 >= queue.length){
      queue  = queue.slice(offset);
      offset = 0;
    }
    return item;
  }
  this.peek = function(){
    return (queue.length > 0 ? queue[offset] : undefined);
  }
}

class Synchronizer {
  constructor(url, main_callback) {
    this.ws = new WebSocket(url);
    this.ws.binaryType = "arraybuffer";
    let synchronizer = this;
    this.ws.addEventListener('open', function (event) {
      console.log('websocket open');
      let join_msg = new UserJoinMessage(1, 'changeme'); // TODO: TEMPORARY FIX
      console.log('sending join message');
      synchronizer.sendMessage(join_msg);
    });
    this.ws.addEventListener('close', function (event) {
      console.log('websocket close');
    });
    this.ws.addEventListener('message', function (event) {
      console.log('message from server:', event.data);
      synchronizer.deserializeMessage(event.data);
      if (!synchronizer.in_game) main_callback();
    });
    this.receivedMessages = new Queue();
    this.in_game = false;
  }

  sendMessage(message) {
    console.log("sendmessage");
    if (this.ws.readyState != 1) return; // OPEN = 1, return if not open
    let data = message.serialize();
    this.ws.send(data);
  }

  deserializeMessage(data) {
    // create message object and enqueue in receivedMessages
    let message = new ServerMessage(data);
    this.receivedMessages.enqueue(message);
  }

  messagesInQueue() {
    if (this.receivedMessages.isEmpty()) return false;
    return true;
  }

  recvMessage() {
    if (this.receivedMessages.isEmpty()) return null;
    else return this.receivedMessages.dequeue();
  }
}

export {
  Synchronizer,
  UserJoinMessage,
  UserMoveMessage,
  UserPlaceBombMessage,
  ServerMessageType
};
