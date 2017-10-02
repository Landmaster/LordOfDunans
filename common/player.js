/**
 * @author Landmaster
 */

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
	 * @type {Vec3}
	 */
	this.pos = Vec3.zero();
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
	
	if (Side.getSide() === Side.CLIENT) {
		this.playerMesh = null;
	}
}


Player.prototype.spawn = function (world) {
	this.world = world;
	this.world.addPlayer(this);
};
Player.prototype.despawn = function () {
	this.world.removePlayer(this);
	this.world = null;
};
Player.prototype.setCharacterType = function (type) {
	this.characterType = type;
	if (Side.getSide() === Side.CLIENT) {
		if (this.playerMesh && this.playerMesh.getScene().getEngine()) {
			this.playerMesh.dispose();
			this.world.sceneElementsToDispose.delete(this.playerMesh);
			this.playerMesh = null;
		}
		
		this.characterType.modelPromise(this.mainInstance).spread(meshes => {
			if (meshes && meshes[0]) {
				this.playerMesh = meshes[0].clone('player_model_'+UuidUtils.bytesToUuid(this.uuid));
				this.playerMesh.isVisible = true;
				this.world.sceneElementsToDispose.add(this.playerMesh);
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

Player.prototype.setPositionAndUpdate = function (pos) {
	this.pos = pos;
	if (Side.getSide() === Side.SERVER) {
		PacketHandler.sendToEndpoint(new Packet.playerPositionPacket(this.uuid, this.pos), this.ws);
	}
};

if (Side.getSide() === Side.CLIENT) {
	Player.prototype.render = function () {
		if (this.playerMesh) {
			this.playerMesh.position = this.pos.toBabylon();
		}
	};
}

module.exports = Player;