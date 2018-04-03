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

module.exports = Packet;