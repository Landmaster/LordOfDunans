/**
 * @author Landmaster
 */

const UuidUtils = require('./lib/uuid_utils');
const Vec3 = require("./math/vec3.js");

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
	this.world.players.set(UuidUtils.bytesToUuid(this.uuid), this);
};
Player.prototype.despawn = function () {
	this.world.players.delete(UuidUtils.bytesToUuid(this.uuid));
	this.world = null;
};
Player.prototype.serialize = function (buf) {
	buf.append(this.uuid);
	buf.writeVString(this.uname);
	Vec3d.toBuf(this.pos, buf);
}
Player.prototype.deserialize = function (buf) {
	this.uuid = buf.readBytes(16);
	this.uname = buf.readVString();
	this.pos = Vec3d.fromBuf(buf);
}

module.exports = Player;