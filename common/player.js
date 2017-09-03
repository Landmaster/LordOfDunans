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
	this.world.addPlayer(this);
};
Player.prototype.despawn = function () {
	this.world.removePlayer(this);
	this.world = null;
};
Player.prototype.serialize = function (buf) {
	buf.append(this.uuid);
	buf.writeVString(this.uname);
	Vec3.toBuf(this.pos, buf);
};
Player.prototype.deserialize = function (buf) {
	this.uuid = new Uint8Array(buf.readBytes(16).toBuffer());
	this.uname = buf.readVString();
	this.pos = Vec3.fromBuf(buf);
};

module.exports = Player;