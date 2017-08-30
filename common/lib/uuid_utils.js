/**
 * @author Landmaster
 */
const UuidUtils = {};

UuidUtils.bytesToUuid = require('uuid/lib/bytesToUuid');
UuidUtils.uuidToBytes = function uuidToBytes(uuid) {
	// Note: We assume we're being passed a valid uuid string
	let bytes = [];
	uuid.replace(/[a-fA-F0-9]{2}/g, function(hex) {
		bytes.push(parseInt(hex, 16));
	});
	
	return bytes;
};

module.exports = UuidUtils;