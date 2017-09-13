/**
 * @author Landmaster
 */
const BSON = require("bson");
let bson = new BSON();

const BufferBSON = {};
/**
 *
 * @param {ByteBuffer} buf
 * @param object
 */
BufferBSON.writeBSON = function (buf, object) {
	const representation = bson.serialize(object, undefined);
	buf.writeVarint32(representation.length);
	buf.append(representation);
};

BufferBSON.readBSON = function (buf) {
	return bson.deserialize(Buffer.from(buf.readBytes(buf.readVarint32()).toBuffer()), undefined);
};
module.exports = BufferBSON;