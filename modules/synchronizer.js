const UserMessageType = {
  Join: 1,     // room id, nickname
  Move: 2,     // direction
  PlaceBomb: 3 // x, y
}

const ServerMessageType = {
  JoinInfo: 1,      // room id, player id, state [waitnext, start], time
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
    view.setUint16(2, this.room_id);
    const encoder = new TextEncoder();
    const encoded_nickname = encoder.encode(this.nickname);
    const data = buffer.concat(encoded_nickname);
    return data;
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
    view.setUint16(1, this.x);
    view.setUint16(3, this.y);
    return buffer;
  }
}

// TODO server messages

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
  constructor(url) {
    this.ws = new WebSocket(url);
    this.ws.addEventListener('open', function (event) {
      console.log('websocket open');
    });
    this.ws.addEventListener('close', function (event) {
      console.log('websocket close');
    });
    this.ws.addEventListener('message', function (event) {
      console.log('message from server:', event.data);
    });
    this.receivedMessages = new Queue();
  }

  sendMessage(message) {
    if (this.ws.readyState != 1) return; // OPEN = 1, return if not open
    let data = message.serialize();
    this.ws.send(data);
  }

  receiveMessage(data) {
    // check message type
    // create message object and enqueue in receivedMessages
  }
}
