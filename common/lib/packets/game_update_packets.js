/**
 * @author Landmaster
 */

const BSON = require("bson");
const BufferBSON = require('common/buffer/buffer_bson');

let bson = new BSON();

const Packet = {};

Packet.updateCrystalPacket = function (playerUUID, crystals) {
	this.playerUUID = playerUUID;
	this.crystals = crystals;
};
Packet.updateCrystalPacket.prototype.deserialize = function (buf) {
	this.playerUUID = buf.readBytes(16);
	this.crystals = BufferBSON.readBSON(buf);
};
Packet.updateCrystalPacket.prototype.serialize = function (buf) {
	buf.append(this.playerUUID);
	BufferBSON.writeBSON(buf, this.crystals);
};


module.exports = Packet;