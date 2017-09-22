/**
 * @author Landmaster
 */

const UuidUtils = require('common/lib/uuid_utils');
const ByteBuffer = require('bytebuffer');

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
			yield clientInstance.thePlayer; // yield main player
		} else {
			yield player;
		}
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

module.exports = Packet;