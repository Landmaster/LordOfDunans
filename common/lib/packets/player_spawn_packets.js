/**
 * @author Landmaster
 */

const Packet = {};

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