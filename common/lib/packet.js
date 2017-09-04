const EntityRegistry = require('common/entity_registry');
const Player = require('common/player');
const UuidUtils = require('common/lib/uuid_utils');
const ByteBuffer = require('bytebuffer');

const Packet = {};

Packet.DataTypeIDs = {
	STRING: 0,
	NUMBER: 1,
	BOOL: 2,
};

/**
 * Create a register packet.
 * @param [uname] the username
 * @param [pword] the password
 * @constructor
 */
Packet.registerPacket = function registerPacket(uname, pword) {
	this.uname = uname;
	this.pword = pword;
};
Packet.registerPacket.prototype.deserialize = function (buf) {
	this.uname = buf.readVString();
	this.pword = buf.readVString();
};
Packet.registerPacket.prototype.serialize = function (buf) {
	buf.writeVString(this.uname);
	buf.writeVString(this.pword);
};

/**
 * Create a login packet.
 * @param [uname] the username
 * @param [pword] the password
 * @constructor
 */
Packet.loginPacket = function loginPacket(uname, pword) {
	this.uname = uname;
	this.pword = pword;
};
Packet.loginPacket.prototype.deserialize = function (buf) {
	this.uname = buf.readVString();
	this.pword = buf.readVString();
};
Packet.loginPacket.prototype.serialize = function (buf) {
	buf.writeVString(this.uname);
	buf.writeVString(this.pword);
};

/**
 * Create a new packet for an account error.
 * @param {AccountError} [error]
 * @param {boolean} [isRegister]
 */
Packet.accountErrorPacket = function (error, isRegister) {
	this.isRegister = isRegister;
	/**
	 * @type Array
	 */
	this.locParams = error ? error.locParams : [];
};
Packet.accountErrorPacket.prototype.deserialize = function (buf) {
	this.isRegister = !!buf.readByte();
	this.locParams = [];
	let len = buf.readVarint32();
	while (len--) {
		switch (buf.readByte()) {
			case Packet.DataTypeIDs.STRING:
				this.locParams.push(buf.readVString());
				break;
			case Packet.DataTypeIDs.NUMBER:
				this.locParams.push(buf.readDouble());
				break;
			case Packet.DataTypeIDs.BOOL:
				this.locParams.push(!!buf.readByte());
				break;
			default:
				throw new RangeError('Could not deserialize, bad data discriminator');
		}
	}
};
Packet.accountErrorPacket.prototype.serialize = function (buf) {
	buf.writeByte(this.isRegister ? 1 : 0);
	buf.writeVarint32(this.locParams.length);
	this.locParams.forEach((param) => {
		if (typeof param === 'number') {
			buf.writeByte(Packet.DataTypeIDs.NUMBER);
			buf.writeDouble(param);
		} else if (typeof param === 'boolean') {
			buf.writeByte(Packet.DataTypeIDs.BOOL);
			buf.writeByte(param ? 1 : 0);
		} else {
			buf.writeByte(Packet.DataTypeIDs.STRING);
			buf.writeVString(param.toString());
		}
	});
};

/**
 * Sent when the user is successfully authenticated.
 * @param uname
 * @param byteUUID
 * @constructor
 */
Packet.accountSuccessPacket = function accountSuccessPacket (uname, byteUUID) {
	this.uname = uname;
	this.uuid = byteUUID;
};
Packet.accountSuccessPacket.prototype.deserialize = function (buf) {
	this.uname = buf.readVString();
	this.uuid = buf.readBytes(16);
};
Packet.accountSuccessPacket.prototype.serialize = function (buf) {
	buf.writeVString(this.uname);
	buf.append(this.uuid);
};


/**
 * Create a logout packet.
 * @constructor
 */
Packet.logoutPacket = function logoutPacket() {};
Packet.logoutPacket.prototype.deserialize = function () {};
Packet.logoutPacket.prototype.serialize = function () {};

/**
 * Create a packet to send to client(s) when a new entity is spawned.
 * @param entity
 * @param byteUUID
 * @constructor
 */
Packet.entitySpawnedPacket = function entitySpawnedPacket(entity, byteUUID) {
	if (arguments.length > 0) {
		this.uuid = byteUUID;
		this.entityID = EntityRegistry.entityToID(entity);
		this.entityBuf = new ByteBuffer();
		entity.serialize(this.entityBuf); // write the entity to the buffer
	}
};
Packet.entitySpawnedPacket.prototype.deserialize = function (buf) {
	this.uuid = buf.readBytes(16);
	this.entityID = buf.readShort();
	this.entityBuf = buf;
};
Packet.entitySpawnedPacket.prototype.serialize = function (buf) {
	buf.append(this.uuid);
	buf.writeShort(this.entityID);
	buf.append(this.entityBuf);
};
Packet.entitySpawnedPacket.prototype.newEntity = function (world) {
	const entity = EntityRegistry.constructEntity(this.entityID, world);
	entity.deserialize(this.entityBuf);
	return entity;
};

/**
 *
 * @param byteUUID
 * @constructor
 */
Packet.entityDeathPacket = function entityDeathPacket(byteUUID) {
	this.uuid = byteUUID;
};
Packet.entityDeathPacket.prototype.deserialize = function (buf) {
	this.uuid = buf.readBytes(16);
};
Packet.entityDeathPacket.prototype.serialize = function (buf) {
	buf.append(this.uuid);
};

/**
 * Sent to client(s) when a player is spawned.
 * @param uname
 * @param byteUUID
 * @constructor
 */
Packet.playerSpawnedPacket = function playerSpawnedPacket (uname, byteUUID) {
	this.uname = uname;
	this.uuid = byteUUID;
};
Packet.playerSpawnedPacket.prototype.deserialize = function (buf) {
	this.uname = buf.readVString();
	this.uuid = buf.readBytes(16);
};
Packet.playerSpawnedPacket.prototype.serialize = function (buf) {
	buf.writeVString(this.uname);
	buf.append(this.uuid);
};

/**
 *
 * @param byteUUID
 * @constructor
 */
Packet.playerDeathPacket = function playerDeathPacket(byteUUID) {
	this.uuid = byteUUID;
};
Packet.playerDeathPacket.prototype.deserialize = function (buf) {
	this.uuid = buf.readBytes(16);
};
Packet.playerDeathPacket.prototype.serialize = function (buf) {
	buf.append(this.uuid);
};

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
Packet.playListPacket.prototype.getPlayers = function* (clientInstance) {
	let _buf = ByteBuffer.wrap(this._buf);
	let len = _buf.readVarint32();
	for (let i=0; i<len; ++i) {
		let player = new Player(clientInstance.theWorld, null, clientInstance, {});
		player.deserialize(_buf);
		if (clientInstance.thePlayer
				&& UuidUtils.bytesToUuid(clientInstance.thePlayer.uuid)
				=== UuidUtils.bytesToUuid(player.uuid)) {
			yield clientInstance.thePlayer; // yield main player
		} else {
			yield player;
		}
	}
};

/**
 *
 * @param byteUUID
 * @constructor
 */
Packet.opponentDisconnectedPacket = function playerDisconnectedPacket(byteUUID) {
	this.uuid = byteUUID;
};
Packet.opponentDisconnectedPacket.prototype.deserialize = function (buf) {
	this.uuid = buf.readBytes(16);
};
Packet.opponentDisconnectedPacket.prototype.serialize = function (buf) {
	buf.append(this.uuid);
};


module.exports = Packet;
