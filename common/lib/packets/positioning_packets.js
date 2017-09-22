/**
 * @author Landmaster
 */

const Vec3 = require("common/math/vec3");

const Packet = {};

/**
 *
 * @param {Uint8Array|ArrayBuffer|ByteBuffer} playerUUID
 * @param {Vec3} pos
 */
Packet.playerPositionPacket = function playerPositionPacket(playerUUID, pos) {
	this.uuid = playerUUID;
	this.pos = pos;
};
Packet.playerPositionPacket.prototype.deserialize = function (buf) {
	this.uuid = buf.readBytes(16);
	this.pos = Vec3.fromBuf(buf);
};
Packet.playerPositionPacket.prototype.serialize = function (buf) {
	buf.append(this.uuid);
	Vec3.toBuf(this.pos, buf);
};

module.exports = Packet;