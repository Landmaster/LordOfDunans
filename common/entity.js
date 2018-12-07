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
const AIManager = require('common/entities/ai/ai_manager');
const World = require('common/world');

let bson = new BSON();

/**
 * Construct an entity.
 * @param world the world
 * @constructor
 */
function Entity(world) {
	this.world = world;
	
	/**
	 * The player that the entity allies with (-1 for neutral).
	 * @type {number}
	 */
	this.side = -1;
	
	if (Side.getSide() === Side.SERVER) {
		this.uuid = v4(null, Buffer.allocUnsafe(16));
	} else {
		this.uuid = Buffer.alloc(16);
	}
	this.pos = Vec3.zero();
	this.velocity = Vec3.zero();
	this.acceleration = Vec3.zero();
	
	this.yaw = 0;
	
	this.pitch = 0;
	
	this.ticksAlive = 0;
	
	this.aiManager = new AIManager(this);
	
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
 *
 * @return {number}
 */
Entity.prototype.getHeight = function () {
	return Math.max(...this.getBoundingBoxes().map(aabb => aabb.vec2.y));
};

/**
 * Deserialize an entity.
 * @param buf
 */
Entity.prototype.deserialize = function (buf) {
	let obj = BufferBSON.readBSON(buf);
	this.uuid = new Uint8Array(obj.uuid.read(0, 16));
	this.pos = Vec3.fromBSON(obj.pos);
	this.side = obj.side;
};
/**
 * Serialize an entity.
 * @param buf
 */
Entity.prototype.serialize = function (buf) {
	BufferBSON.writeBSON(buf, {
		uuid: new BSON.Binary(toBuffer(this.uuid), BSON.BSON_BINARY_SUBTYPE_UUID),
		pos: Vec3.toBSON(this.pos),
		side: this.side
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
		this.modelPromise().spread((meshes) => {
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
	
	Entity.prototype.modelPromise = function () {
		return this.world.mainInstance.renderManager.loadModel(EntityRegistry.entityClassToId(this.constructor), '/assets/models/entities/', this.model());
	};
	
	Entity.prototype.render = function () {
		if (this.mesh) {
			this.mesh.position = this.pos.toBabylon();
			this.mesh.rotation = new BABYLON.Vector3(0, -this.yaw, 0);
		}
	};
} else {
	Entity.prototype.updateTick = function (delta) {
		++this.ticksAlive;
		
		this.aiManager.updateTick(delta);
		
		this.velocity = this.velocity.add(this.acceleration.scale(1/World.TICKS_PER_SEC));
		
		let oldPos = this.pos;
		this.pos = this.pos.add(this.velocity.scale(1/World.TICKS_PER_SEC));
		
		let rayScale = this.world.rayTraceScaleFactor(oldPos, this.pos);
		if (0 <= rayScale && rayScale <= 1.001) {
			this.pos = oldPos.add(this.pos.sub(oldPos).scale(Math.min(rayScale - 0.002, 0)));
		}
		/*
		if (this.ticksAlive % 60 === 0) {
			console.log(this.pos);
		}*/
	};
}

module.exports = Entity;