/**
 * @author Landmaster
 */

const BSON = require("bson");
const BufferBSON = require('common/buffer/buffer_bson');

const DataTypeIDs = require('common/lib/data_type_ids');

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

Packet.sendMessagePacket = function (message, messageType) {
	this.message = message;
	this.messageType = messageType;
};
Packet.sendMessagePacket.prototype.deserialize = function (buf) {
	this.message = buf.readVString();
	this.messageType = buf.readVString();
};
Packet.sendMessagePacket.prototype.serialize = function (buf) {
	buf.writeVString(this.message);
	buf.writeVString(this.messageType);
};

Packet.sendFormattedMessagePacket = function (locParams, messageType) {
	this.locParams = locParams;
	this.messageType = messageType;
};
Packet.sendFormattedMessagePacket.prototype.deserialize = function (buf) {
	this.locParams = [];
	let len = buf.readVarint32();
	while (len--) {
		switch(buf.readByte()) {
			case DataTypeIDs.STRING:
				this.locParams.push(buf.readVString());
				break;
			case DataTypeIDs.NUMBER:
				this.locParams.push(buf.readDouble());
				break;
			case DataTypeIDs.BOOL:
				this.locParams.push(!!buf.readByte());
				break;
			default:
				throw new RangeError('Could not deserialize, bad data discriminator');
		}
	}
	this.messageType = buf.readVString();
};
Packet.sendFormattedMessagePacket.prototype.serialize = function (buf) {
	buf.writeVarint32(this.locParams.length);
	this.locParams.forEach((param) => {
		if (typeof param === 'number') {
			buf.writeByte(DataTypeIDs.NUMBER);
			buf.writeDouble(param);
		} else if (typeof param === 'boolean') {
			buf.writeByte(DataTypeIDs.BOOL);
			buf.writeByte(param ? 1 : 0);
		} else {
			buf.writeByte(DataTypeIDs.STRING);
			buf.writeVString(param.toString());
		}
	});
	buf.writeVString(this.messageType);
};


module.exports = Packet;