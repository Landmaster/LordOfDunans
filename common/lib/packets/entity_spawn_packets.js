/**
 * @author Landmaster
 */

const EntityRegistry = require('common/entity_registry');

const Packet = {};

/**
 * Create a packet to send to client(s) when a new entity is spawned.
 * @param entity
 * @param byteUUID
 * @constructor
 */
Packet.entitySpawnedPacket = function entitySpawnedPacket(entity, byteUUID) {
	if (arguments.length > 0) {
		this.entityID = EntityRegistry.entityClassToId(entity.constructor);
		this.entityBuf = new ByteBuffer();
		entity.serialize(this.entityBuf); // write the entity to the buffer
	}
};
Packet.entitySpawnedPacket.prototype.deserialize = function (buf) {
	this.entityID = buf.readVString();
	this.entityBuf = buf;
};
Packet.entitySpawnedPacket.prototype.serialize = function (buf) {
	buf.writeVString(this.entityID);
	buf.append(this.entityBuf);
};
Packet.entitySpawnedPacket.prototype.newEntity = function (world) {
	const entity = EntityRegistry.constructEntity(this.entityID, world);
	entity.deserialize(this.entityBuf);
	return entity;
};

/**
 *
 * @param byteUUID
 * @constructor
 */
Packet.entityDespawnPacket = function entityDeathPacket(byteUUID) {
	this.uuid = byteUUID;
};
Packet.entityDespawnPacket.prototype.deserialize = function (buf) {
	this.uuid = buf.readBytes(16);
};
Packet.entityDespawnPacket.prototype.serialize = function (buf) {
	buf.append(this.uuid);
};

module.exports = Packet;