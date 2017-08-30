const v4 = require('uuid/v4');
const Side = require('./lib/side');
const Vec3 = require('./math/vec3');
const UuidUtils = require('./lib/uuid_utils');

function Entity(world) {
	this.world = world;
	if (Side.getSide() === Side.SERVER) {
		this.uuid = v4(null, Buffer.allocUnsafe(16));
	}
	this.pos = Vec3.zero();
}

Entity.prototype.deserialize = function (buf) {
	this.pos.deserialize(buf);
	this.uuid = buf.readBytes(16);
};
Entity.prototype.serialize = function (buf) {
	this.pos.serialize(buf);
	buf.append(this.uuid);
};

/**
 * Spawn an entity in a world.
 * @param {World} world
 */
Entity.prototype.spawn = function(world) {
	this.world = world;
	if (Side.getSide() === Side.SERVER) {
		this.world.nonPlayerEntities.set(UuidUtils.bytesToUuid(this.uuid), this);
	}
};

Entity.prototype.despawn = function() {
	if (Side.getSide() === Side.SERVER) {
		this.world.nonPlayerEntities.delete(UuidUtils.bytesToUuid(this.uuid));
	}
	this.world = null;
};

Entity.prototype.hitBox = function() {
};

if (Side.getSide() === Side.CLIENT) {
	Entity.prototype.animate = function () {
	};

	Entity.prototype.render = function () {
	};
}

module.exports = Entity;