const v4 = require('uuid/v4');
const Side = require('./lib/side');
const Vec3 = require('./math/vec3');
const UuidUtils = require('./lib/uuid_utils');
const BSON = require('bson');
const BufferBSON = require('common/buffer/buffer_bson');
const toBuffer = require('typedarray-to-buffer');

let bson = new BSON();

function Entity(world) {
	this.world = world;
	if (Side.getSide() === Side.SERVER) {
		this.uuid = v4(null, Buffer.allocUnsafe(16));
	}
	this.pos = Vec3.zero();
}

/**
 * For each tower class, set this property to {@code true}.
 * @type {boolean}
 */
Entity.prototype.isTower = false;

/**
 * Deserialize an entity.
 * @param buf
 */
Entity.prototype.deserialize = function (buf) {
	let obj = BufferBSON.readBSON(buf);
	this.uuid = new Uint8Array(obj.uuid.read(0, 16));
	this.pos = Vec3.fromBSON(obj.pos);
};
/**
 * Serialize an entity.
 * @param buf
 */
Entity.prototype.serialize = function (buf) {
	BufferBSON.writeBSON(buf, {
		uuid: new BSON.Binary(toBuffer(this.uuid), BSON.BSON_BINARY_SUBTYPE_UUID),
		pos: Vec3.toBSON(this.pos)
	});
};

/**
 * Spawn an entity in a world.
 * @param {World} world
 */
Entity.prototype.spawn = function(world) {
	this.world = world;
	this.world.addEntity(this);
};

Entity.prototype.despawn = function() {
	this.world.removeEntity(this);
	this.world = null;
};

Entity.prototype.hitBox = function() {
};

if (Side.getSide() === Side.CLIENT) {
	/**
	 * The icon of the entity, if it is a tower.
	 * @type {string}
	 */
	Entity.prototype.towerIcon = "";
	
	Entity.prototype.animate = function () {
	};

	Entity.prototype.render = function () {
	};
}

module.exports = Entity;