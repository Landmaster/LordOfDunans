/**
 * @author Landmaster
 */
require('css.escape');

const Promise = require('bluebird');
const UuidUtils = require('./lib/uuid_utils');
const Vec3 = require("./math/vec3.js");
const BufferBSON = require('common/buffer/buffer_bson');
const BSON = require("bson");
const toBuffer = require('typedarray-to-buffer');
const CharacterTypeBase = require("./character_types/character_type_base");
const EventBus = require('eventbusjs');
const SetCharacterTypeEvent = require("./events/set_character_type");
const Side = require("./lib/side");
const PacketHandler = require("./lib/packethandler");
const Packet = require("./lib/packet");
const EntityRegistry = require("common/entity_registry");
const SetChosenTowersEvent = require("./events/set_chosen_towers");
const Directions = require('common/lib/directions');
const World = require("./world");
const AABB = require('common/math/aabb');
const GameWorld = require('common/gameplay/game_world');

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
	/**
	 *
	 * @type {World}
	 */
	this.world = world;
	
	/**
	 *
	 * @type {number}
	 */
	this.hp = 10000;
	
	/**
	 * @type {!Vec3}
	 */
	this.pos = Vec3.zero();
	
	/**
	 * Relative to +x. CC is positive.
	 * TODO change if not correct
	 * @type {number}
	 */
	this.yaw = 0;
	
	/**
	 * Relative to horizontal.
	 * @type {number}
	 */
	this.pitch = 0;
	
	/**
	 * In units/second.
	 * @type {!Vec3}
	 */
	this.velocity = Vec3.zero();
	
	/**
	 * In units/second^2.
	 * @type {!Vec3}
	 */
	this.acceleration = Vec3.zero();
	
	this.movementDirections = new Set();
	
	/**
	 *
	 * @type {WebSocket}
	 */
	this.ws = ws;
	/**
	 *
	 * @type {Server|Dunans}
	 */
	this.mainInstance = mainInstance;
	/**
	 *
	 * @type {Uint8Array}
	 */
	this.uuid = options ? options.uuid : null;
	/**
	 * @type {string}
	 */
	this.uname = options ? options.uname : null;
	
	/**
	 *
	 * @type {CharacterTypeBase}
	 */
	this.characterType = CharacterTypeBase.EMPTY;
	
	/**
	 *
	 * @type {Array.<Function>}
	 */
	this.chosenTowers = new Array(EntityRegistry.TOWERS_PER_PLAYER);
	
	this.crystals = {
		red: 0,
		green: 0,
		blue: 0,
	};
	
	if (Side.getSide() === Side.CLIENT) {
		this._doUpdateCrystals = true;
	}
	
	/**
	 * The index of a player is a number, 0 or 1, which determines the
	 * order of two competing players. The player who waits for the
	 * opponent gets index 0, whereas the player who plays with a
	 * waiting player gets index 1.
	 * @type {number}
	 */
	this.index = 0;
	
	if (Side.getSide() === Side.CLIENT) {
		/**
		 *
		 * @type {?BABYLON.Mesh}
		 */
		this.playerMesh = null;
		
		this.hpTexture = null;
		this.hpSpriteManager = null;
		this.hpSprite = null;
	}
}

Player.prototype.getMaxHP = function () {
	return 10000;
};

Player.prototype.verifyPlayable = function () {
	if (this.characterType === CharacterTypeBase.EMPTY) {
		return false;
	}
	for (let i=0; i<EntityRegistry.TOWERS_PER_PLAYER; ++i) {
		if (!this.chosenTowers[i]) {
			return false;
		}
	}
	return true;
};
Player.prototype.spawn = function (world) {
	this.world = world;
	this.world.addPlayer(this);
	if (Side.getSide() === Side.CLIENT) {
		const BABYLON = require('babylonjs');
		const HPBar = require('client/lib/render/textures/hp_bar');
		
		this.characterType.modelPromise(this.mainInstance).spread(meshes => {
			if (meshes && meshes[0]) {
				this.playerMesh = meshes[0].clone('player_model_'+UuidUtils.bytesToUuid(this.uuid));
				this.playerMesh.isVisible = true;
			} else {
				this.playerMesh = null;
			}
		});
		
		if (this.world instanceof GameWorld) {
			this.hpTexture = new HPBar(this, this.world.scene);
			this.hpTexture.hasAlpha = true;
			this.hpTexture.wrapU = this.hpTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
			
			this.hpSpriteManager = new BABYLON.SpriteManager('sprite_manager_' + UuidUtils.bytesToUuid(this.uuid), '', 1, 256, this.world.scene);
			this.hpSpriteManager.texture.dispose();
			
			// darn it WebStorm…
			// noinspection JSValidateTypes
			this.hpSpriteManager.texture = this.hpTexture;
			
			this.hpSprite = new BABYLON.Sprite("hp_sprite_" + UuidUtils.bytesToUuid(this.uuid), this.hpSpriteManager);
			this.hpSprite.size = 1.6;
			this.hpSprite.invertV = -1;
		}
	}
};
Player.prototype.despawn = function () {
	this.world.removePlayer(this);
	this.world = null;
	if (Side.getSide() === Side.CLIENT) {
		if (this.playerMesh && this.playerMesh.getScene().getEngine()) {
			this.playerMesh.dispose();
			this.playerMesh = null;
		}
		
		if (this.hpTexture && this.hpTexture.getScene().getEngine()) {
			this.hpSprite.dispose();
			this.hpSpriteManager.dispose();
			this.hpTexture.dispose();
			
			this.hpTexture = null;
			this.hpSpriteManager = null;
			this.hpSprite = null;
		}
	}
};
Player.prototype.setCharacterType = function (type) {
	this.characterType = type;
	if (Side.getSide() === Side.CLIENT) {
		if (this.playerMesh && this.playerMesh.getScene().getEngine()) {
			this.playerMesh.dispose();
			this.playerMesh = null;
		}
		
		this.characterType.modelPromise(this.mainInstance).spread(meshes => {
			if (meshes && meshes[0]) {
				this.playerMesh = meshes[0].clone('player_model_'+UuidUtils.bytesToUuid(this.uuid));
				this.playerMesh.isVisible = true;
			} else {
				this.playerMesh = null;
			}
		});
	}
	EventBus.dispatch(SetCharacterTypeEvent.NAME, this, new SetCharacterTypeEvent(this));
};

Player.prototype.clearChosenTowers = function () {
	this.chosenTowers = new Array(EntityRegistry.TOWERS_PER_PLAYER);
	EventBus.dispatch(SetChosenTowersEvent.NAME, this, new SetChosenTowersEvent(this));
};
Player.prototype.toggleChosenTower = function (towerClass) {
	let idx = this.chosenTowers.indexOf(towerClass);
	if (idx >= 0) {
		this.chosenTowers[idx] = null;
	} else {
		for (let i=0; i<this.chosenTowers.length; ++i) {
			if (!this.chosenTowers[i]) {
				this.chosenTowers[i] = towerClass;
				break;
			}
		}
	}
	EventBus.dispatch(SetChosenTowersEvent.NAME, this, new SetChosenTowersEvent(this));
};
Player.prototype.setChosenTowers = function (towers) {
	this.chosenTowers = [...towers];
	this.chosenTowers.length = EntityRegistry.TOWERS_PER_PLAYER;
	EventBus.dispatch(SetChosenTowersEvent.NAME, this, new SetChosenTowersEvent(this));
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
Player.prototype.getEyeHeight = function () {
	return 2.8;
};

/**
 *
 * @param {Vec3} pos
 */
Player.prototype.setPositionAndUpdate = function (pos) {
	this.pos = pos;
	if (Side.getSide() === Side.SERVER) {
		PacketHandler.sendToEndpoint(new Packet.playerPositionPacket(this.uuid, this.pos), this.ws);
	}
};

Player.prototype.setRotationAndUpdate = function (yaw, pitch) {
	this.yaw = yaw;
	this.pitch = pitch;
	if (Side.getSide() === Side.SERVER) {
		PacketHandler.sendToEndpoint(new Packet.playerRotationPacket(this.uuid, this.yaw, this.pitch), this.ws);
	}
};

Player.prototype.getLookVec = function () {
	return new Vec3(
		Math.cos(this.yaw)*Math.cos(this.pitch),
		Math.sin(this.pitch),
		Math.sin(this.yaw)*Math.cos(this.pitch));
};

Player.prototype.getLookRange = function () {
	return 9.3;
};

/**
 *
 * @return {Array.<AABB>}
 */
Player.prototype.getBoundingBoxes = function () {
	return this.characterType.getBoundingBoxes(); // delegates to the character type
};

/**
 *
 * @return {number}
 */
Player.prototype.getHeight = function () {
	return Math.max(...this.getBoundingBoxes().map(aabb => aabb.vec2.y));
};

if (Side.getSide() === Side.CLIENT) {
	const BABYLON = require('babylonjs');
	
	Player.prototype.render = function () {
		if (this.playerMesh) {
			this.playerMesh.position = this.pos.toBabylon();
			this.playerMesh.rotation = new BABYLON.Vector3(0, -this.yaw, 0);
		}
		this.pos = this.pos.add(this.velocity.scale(this.mainInstance.engine.getDeltaTime() / 1000));
		
		if (this.mainInstance.thePlayer === this && !((this.mainInstance.frame - this.world.initialFrame) % 9)) {
			this.mainInstance.sendToServer(new Packet.playerRotationPacket(this.uuid, this.yaw, this.pitch));
		}
		
		if (this.playerMesh && this.hpSprite) {
			//if (!(this.mainInstance.frame % 20)) console.log(this.hpSprite);
			this.hpSprite.position = this.pos.addTriple(0, this.getHeight() * 1.4, 0).toBabylon();
		}
		
		this.updateCrystals();
	};
	
	Player.prototype.markCrystalsForUpdate = function () {
		this._doUpdateCrystals = true;
	};
	
	Player.prototype.updateCrystals = function () {
		if (this._doUpdateCrystals) {
			let crystalBar = document.getElementById("crystal_bar");
			
			for (let crystalName in this.crystals) {
				if (this.crystals.hasOwnProperty(crystalName)) {
					let crystalNumber = crystalBar.querySelector("[data-crystal=" + CSS.escape(crystalName) + "]");
					crystalNumber.textContent = this.crystals[crystalName];
				}
			}
			
			this._doUpdateCrystals = false;
		}
	};
} else {
	Player.prototype.updateTick = function (delta) {
		if (this.pos.y <= 1e-4) { // on ground
			this.acceleration = Vec3.zero();
			let nonRotatedDirs = Vec3.zero();
			for (let dir of this.movementDirections) {
				nonRotatedDirs = nonRotatedDirs.add(Directions.getUnitVector(dir));
			}
			let rotatedDirs = nonRotatedDirs.rotate(this.yaw, 0);
			this.velocity = rotatedDirs.scale(this.characterType.maxWalkVelocity());
		}
		
		this.velocity = this.velocity.add(this.acceleration.scale(1/World.TICKS_PER_SEC));
		
		let oldPos = this.pos;
		this.pos = this.pos.add(this.velocity.scale(1/World.TICKS_PER_SEC));
		
		let rayScale = this.world.rayTraceScaleFactor(oldPos, this.pos);
		if (0 <= rayScale && rayScale <= 1.001) {
			this.pos = oldPos.add(this.pos.sub(oldPos).scale(Math.min(rayScale - 0.002, 0)));
		}
	};
}

module.exports = Player;