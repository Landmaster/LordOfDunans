/**
 * @author Landmaster
 */

const UuidUtils = require('./lib/uuid_utils');
const Vec3 = require("./math/vec3.js");
const BufferBSON = require('common/buffer/buffer_bson');
const BSON = require("bson");
const toBuffer = require('typedarray-to-buffer');

let bson = new BSON();

/**
 * Create a player
 * @param {World} world
 * @param {WebSocket} ws the WebSocket endpoint (null on opponent client)
 * @param {Server|Dunans} mainInstance
 * @param {Object} options
 * @param {Uint8Array} [options.uuid] the player uuid
 * @param {string} [options.uname]
 * @constructor
 */
function Player(world, ws, mainInstance, options) {
	this.world = world;
	this.pos = Vec3.zero();
	this.ws = ws;
	this.mainInstance = mainInstance;
	/**
	 *
	 * @type {Uint8Array}
	 */
	this.uuid = options ? options.uuid : null;
	this.uname = options ? options.uname : null;
}
Player.prototype.spawn = function (world) {
	this.world = world;
	this.world.addPlayer(this);
};
Player.prototype.despawn = function () {
	this.world.removePlayer(this);
	this.world = null;
};
Player.prototype.serialize = function (buf) {
	BufferBSON.writeBSON(buf, {
		uuid: new BSON.Binary(toBuffer(this.uuid), BSON.BSON_BINARY_SUBTYPE_UUID),
		uname: this.uname,
		pos: Vec3.toBSON(this.pos)
	});
};
Player.prototype.deserialize = function (buf) {
	let obj = BufferBSON.readBSON(buf);
	this.uuid = new Uint8Array(obj.uuid.read(0, 16));
	this.uname = obj.uname;
	this.pos = Vec3.fromBSON(obj.pos);
};

module.exports = Player;