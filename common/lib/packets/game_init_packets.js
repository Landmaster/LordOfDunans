/**
 * @author Landmaster
 */

const UuidUtils = require('common/lib/uuid_utils');
const ByteBuffer = require('bytebuffer');

const EntityRegistry = require('common/entity_registry');

const Packet = {};

// Sent to the server to play a game.
Packet.playPacket = function playPacket() {};
Packet.playPacket.prototype.deserialize = function () {};
Packet.playPacket.prototype.serialize = function () {};

// Sent to the client to notify that finding an opponent has timed out.
Packet.timeoutPacket = function timeoutPacket() {};
Packet.timeoutPacket.prototype.deserialize = function () {};
Packet.timeoutPacket.prototype.serialize = function () {};

Packet.playListPacket = function playListPacket(players) {
	let _buf = new ByteBuffer();
	if (players) {
		_buf.writeVarint32(players.length);
		players.forEach(player => player.serialize(_buf));
		_buf.flip();
	}
	/**
	 * @type {ArrayBuffer}
	 */
	this._buf = _buf.toBuffer();
};
Packet.playListPacket.prototype.deserialize = function (buf) {
	this._buf = buf.toBuffer();
};
Packet.playListPacket.prototype.serialize = function (buf) {
	buf.append(this._buf);
};
/**
 * Get the players of the packet.
 * @param clientInstance the client instance
 * @yields {Player}
 */
Packet.playListPacket.prototype.getPlayers = function* (clientInstance) {
	const Player = require('common/player');
	
	let _buf = ByteBuffer.wrap(this._buf);
	let len = _buf.readVarint32();
	for (let i=0; i<len; ++i) {
		let player = new Player(clientInstance.theWorld, null, clientInstance, {});
		player.deserialize(_buf);
		if (clientInstance.thePlayer
			&& UuidUtils.bytesToUuid(clientInstance.thePlayer.uuid)
			=== UuidUtils.bytesToUuid(player.uuid)) {
			player = clientInstance.thePlayer; // yield main player
		}
		player.index = i;
		yield player;
	}
};

/**
 *
 * @param {Uint8Array|ArrayBuffer|ByteBuffer} playerUUID
 * @param {string} characterIdentifier
 */
Packet.setCharacterTypePacket = function setCharacterTypePacket(playerUUID, characterIdentifier) {
	this.uuid = playerUUID;
	this.characterIdentifier = characterIdentifier;
};
Packet.setCharacterTypePacket.prototype.deserialize = function (buf) {
	this.uuid = buf.readBytes(16);
	this.characterIdentifier = buf.readVString();
};
Packet.setCharacterTypePacket.prototype.serialize = function (buf) {
	buf.append(this.uuid);
	buf.writeVString(this.characterIdentifier);
};

Packet.setTowerPacket = function setTowerPacket(playerUUID, tower) {
	this.uuid = playerUUID;
	this.tower = tower;
};
Packet.setTowerPacket.prototype.deserialize = function (buf) {
	this.uuid = buf.readBytes(16);
	this.tower = EntityRegistry.entityClassFromId(buf.readVString());
};
Packet.setTowerPacket.prototype.serialize = function (buf) {
	buf.append(this.uuid);
	buf.writeVString(EntityRegistry.entityClassToId(this.tower));
};

Packet.setAllTowersPacket = function setAllTowersPacket(playerUUID, ...towers) {
	this.uuid = playerUUID;
	this.towers = towers;
};
Packet.setAllTowersPacket.prototype.deserialize = function (buf) {
	this.uuid = buf.readBytes(16);
	
	let len = buf.readVarint32();
	this.towers = new Array(len);
	
	for (let i=0; i<len; ++i) {
		if (buf.readByte()) {
			this.towers[i] = EntityRegistry.entityClassFromId(buf.readVString());
		}
	}
};
Packet.setAllTowersPacket.prototype.serialize = function (buf) {
	buf.append(this.uuid);
	buf.writeVarint32(this.towers.length);
	
	for (let i=0; i<this.towers.length; ++i) {
		if (this.towers[i]) {
			buf.writeByte(1);
			buf.writeVString(EntityRegistry.entityClassToId(this.towers[i]));
		} else {
			buf.writeByte(0);
		}
	}
};

Packet.startGamePacket = function startGamePacket() {};
Packet.startGamePacket.prototype.deserialize = function () {};
Packet.startGamePacket.prototype.serialize = function () {};

Packet.prepTimerPacket = function prepTimerPacket(time) {
	this.time = time;
};
Packet.prepTimerPacket.prototype.deserialize = function (buf) {
	this.time = buf.readDouble();
};
Packet.prepTimerPacket.prototype.serialize = function (buf) {
	buf.writeDouble(this.time);
};

Packet.notStartedInTimePacket = function notStartedInTimePacket(isCauser) {
	this.isCauser = isCauser;
};
Packet.notStartedInTimePacket.prototype.deserialize = function (buf) {
	this.isCauser = !!buf.readByte();
};
Packet.notStartedInTimePacket.prototype.serialize = function (buf) {
	buf.writeByte(this.isCauser ? 1 : 0);
};

Packet.startedGamePacket = function startedGamePacket () {};
Packet.startedGamePacket.prototype.deserialize = function () {};
Packet.startedGamePacket.prototype.serialize = function () {};

module.exports = Packet;