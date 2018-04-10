/**
 * @author Landmaster
 */

const Packet = {};

Packet.updatePlayerHPPacket = function (playerUUID, hp) {
	this.playerUUID = playerUUID;
	this.hp = hp;
};
Packet.updatePlayerHPPacket.prototype.deserialize = function (buf) {
	this.playerUUID = buf.readBytes(16);
	this.hp = buf.readVarint32();
};
Packet.updatePlayerHPPacket.prototype.serialize = function (buf) {
	buf.append(this.playerUUID);
	buf.writeVarint32(this.hp);
};

Packet.updateAttackPacket = function (playerUUID, idx, attackName) {
	this.playerUUID = playerUUID;
	this.idx = idx;
	this.attackName = attackName;
};
Packet.updateAttackPacket.prototype.deserialize = function (buf) {
	this.playerUUID = buf.readBytes(16);
	this.idx = buf.readVarint32();
	this.attackName = buf.readVString();
};
Packet.updateAttackPacket.prototype.serialize = function (buf) {
	buf.append(this.playerUUID);
	buf.writeVarint32(this.idx);
	buf.writeVString(this.attackName);
};

Packet.requestAttackPacket1 = function () {};
Packet.requestAttackPacket1.prototype.deserialize = function (buf) {};
Packet.requestAttackPacket1.prototype.serialize = function (buf) {};

/**
 *
 * @param playerUUID
 * @param idx Note that {@code -1} means to reset the current attack to {@code null}.
 */
Packet.updateCurrentAttackPacket = function (playerUUID, idx) {
	this.playerUUID = playerUUID;
	this.attackIdx = idx;
};
Packet.updateCurrentAttackPacket.prototype.deserialize = function (buf) {
	this.playerUUID = buf.readBytes(16);
	this.attackIdx = buf.readVarint32ZigZag(); // to handle -1
};
Packet.updateCurrentAttackPacket.prototype.serialize = function (buf) {
	buf.append(this.playerUUID);
	buf.writeVarint32ZigZag(this.attackIdx);
};

module.exports = Packet;