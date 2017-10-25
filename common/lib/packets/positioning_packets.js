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

/**
 *
 * @param playerUUID
 * @param velocity
 */
Packet.playerVelocityPacket = function playerVelocityPacket(playerUUID, velocity) {
	this.uuid = playerUUID;
	this.velocity = velocity;
};
Packet.playerVelocityPacket.prototype.deserialize = function (buf) {
	this.uuid = buf.readBytes(16);
	this.velocity = Vec3.fromBuf(buf);
};
Packet.playerVelocityPacket.prototype.serialize = function (buf) {
	buf.append(this.uuid);
	Vec3.toBuf(this.velocity, buf);
};

Packet.playerRotationPacket = function playerRotationPacket(playerUUID, yaw, pitch) {
	this.uuid = playerUUID;
	this.yaw = yaw;
	this.pitch = pitch;
};
Packet.playerRotationPacket.prototype.deserialize = function (buf) {
	this.uuid = buf.readBytes(16);
	this.yaw = buf.readDouble();
	this.pitch = buf.readDouble();
};
Packet.playerRotationPacket.prototype.serialize = function (buf) {
	buf.append(this.uuid);
	buf.writeDouble(this.yaw);
	buf.writeDouble(this.pitch);
};


/**
 *
 * @param direction
 * @param doStop
 */
Packet.controlPlayerPacket = function controlPlayerPacket(direction, doStop) {
	this.direction = direction;
	this.doStop = doStop;
};
Packet.controlPlayerPacket.prototype.deserialize = function (buf) {
	this.direction = buf.readByte();
	this.doStop = !!buf.readByte();
};
Packet.controlPlayerPacket.prototype.serialize = function (buf) {
	buf.writeByte(this.direction);
	buf.writeByte(this.doStop ? 1 : 0);
};

module.exports = Packet;