/**
 * @author Landmaster
 */

const Packet = {};

const DataTypeIDs = require('common/lib/data_type_ids');

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
};
Packet.accountErrorPacket.prototype.serialize = function (buf) {
	buf.writeByte(this.isRegister ? 1 : 0);
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

module.exports = Packet;