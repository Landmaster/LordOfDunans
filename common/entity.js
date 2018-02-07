const v4 = require('uuid/v4');
const Side = require('./lib/side');
const Vec3 = require('./math/vec3');
const UuidUtils = require('./lib/uuid_utils');
const BSON = require('bson');
const BufferBSON = require('common/buffer/buffer_bson');
const toBuffer = require('typedarray-to-buffer');
const EntityRegistry = require("./entity_registry");
const PacketHandler = require("common/lib/packethandler");
const Packet = require("./lib/packets/entity_spawn_packets");
const AABB = require("common/math/aabb");

let bson = new BSON();

/**
 * Construct an entity.
 * @param world the world
 * @constructor
 */
function Entity(world) {
	this.world = world;
	if (Side.getSide() === Side.SERVER) {
		this.uuid = v4(null, Buffer.allocUnsafe(16));
	} else {
		this.uuid = Buffer.alloc(16);
	}
	this.pos = Vec3.zero();
	
	this.yaw = 0;
	
	this.pitch = 0;
	
	if (Side.getSide() === Side.CLIENT) {
		this.mesh = null;
	}
}

/**
 * For each tower class, set this property to {@code true}.
 * @type {boolean}
 */
Object.defineProperty(Entity.prototype, 'isTower', {
	value: false
});

/**
 * For tower classes, this is the cost of the tower in crystals.
 * @type {{red, blue, green}}
 */
Object.defineProperty(Entity.prototype, 'towerCost', {
	value: { red: 120, blue: 120, green: 120 }
});

/**
 *
 * @return {Array.<AABB>}
 */
Entity.prototype.getBoundingBoxes = function () {
	return [new AABB(new Vec3(-1,0,-1), new Vec3(1,4,1))];
};

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
	if (Side.getSide() === Side.CLIENT) {
		let model = this.model();
		this.world.mainInstance.renderManager.loadModel(EntityRegistry.entityClassToId(this.constructor), '/assets/models/entities/', model)
			.spread((meshes) => {
				//console.log(meshes);
				if (meshes && meshes[0]) {
					this.mesh = meshes[0].clone('entity_model_'+UuidUtils.bytesToUuid(this.uuid));
					this.mesh.isVisible = true;
					//console.log(this.mesh);
				} else {
					this.mesh = null;
				}
			});
	} else {
		let pkt = new Packet.entitySpawnedPacket(this, this.uuid);
		this.world.players.forEach(player => void(PacketHandler.sendToEndpoint(pkt, player.ws)));
	}
};

Entity.prototype.despawn = function() {
	this.world.removeEntity(this);
	this.world = null;
	if (Side.getSide() === Side.CLIENT) {
		if (this.mesh && this.mesh.getScene().getEngine()) {
			this.mesh.dispose();
			this.mesh = null;
		}
	} else {
		let pkt = new Packet.entityDespawnPacket(this.uuid);
		this.world.players.forEach(player => void(PacketHandler.sendToEndpoint(pkt, player.ws)));
	}
};

if (Side.getSide() === Side.CLIENT) {
	const BABYLON = require('babylonjs');
	
	/**
	 * The icon of the entity, if it is a tower.
	 * @type {string}
	 */
	Object.defineProperty(Entity.prototype, 'towerIcon', {
		value: ""
	});
	
	Entity.prototype.model = function () {
		return EntityRegistry.entityClassToId(this.constructor) + '.babylon';
	};
	
	Entity.prototype.animate = function () {
	};

	Entity.prototype.render = function () {
		if (this.mesh) {
			this.mesh.position = this.pos.toBabylon();
			this.mesh.rotation = new BABYLON.Vector3(0, -this.yaw, 0);
		}
	};
} else {
	Entity.prototype.updateTick = function (delta) {
	};
}

module.exports = Entity;