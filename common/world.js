/**
 * Games and menu screens are implemented as "worlds" in Lord of Dunans. The programming concept was inspired in
 * part by Minecraft.
 * @author Landmaster
 */

const Side = require('./lib/side');
const gameloop = require('node-gameloop');
const UuidUtils = require('./lib/uuid_utils');
const EventBus = require('eventbusjs');
const EntityAddedEvent = require('common/events/entity_added');
const EntityRemovedEvent = require('common/events/entity_removed');
const PlayerAddedEvent = require('common/events/player_added');
const PlayerRemovedEvent = require('common/events/player_removed');
const WorldLoadedEvent = require("./events/world_loaded");
const WorldUnloadedEvent = require("./events/world_unloaded");
const Vec3 = require("common/math/vec3");
const Plane = require("./math/plane");

/**
 * Create a new world.
 * @param {Server|Dunans} mainInstance mainInstance the server/client instance
 * @constructor
 */
function World(mainInstance) {
	this.mainInstance = mainInstance;
	
	this.isLoaded = false;

	if (Side.getSide() === Side.CLIENT) {
		const BABYLON = require('babylonjs');
		
		/**
		 * The frame that the world started in.
		 * @type {number}
		 */
		this.initialFrame = this.mainInstance.frame;
		
		this.scene = null;
		this.renderManager = null;
		
		this.camera = null;
		
		/**
		 * Stores the HTML DOM elements to toggle display on load/unload. The array elements
		 * are either {@link Element}s or {@link Array}s each holding the {@link Element}, the
		 * load callback, and the unload callback respectively.
		 * @type {Array.<Element|Array>}
		 */
		this.htmlElementsToToggle = [];
		
		/**
		 * When the world is unloaded, dispose these scene elements.
		 * @type {Set}
		 */
		this.sceneElementsToDispose = new Set();
	} else {
		this.elapsedTicks = 0;
	}
	
	/**
	 * UUID => player
	 * @type {Map.<string, Player>}
	 */
	this.players = new Map();
	
	/**
	 *
	 * @type {Map.<string, Entity>}
	 */
	this.nonPlayerEntities = new Map();
}

World.prototype.addEntity = function (entity) {
	this.nonPlayerEntities.set(UuidUtils.bytesToUuid(entity.uuid), entity);
	EventBus.dispatch(EntityAddedEvent.NAME, this, new EntityAddedEvent(this, entity));
};

World.prototype.removeEntity = function (entity) {
	this.nonPlayerEntities.delete(UuidUtils.bytesToUuid(entity.uuid));
	EventBus.dispatch(EntityRemovedEvent.NAME, this, new EntityRemovedEvent(this, entity));
};

World.prototype.addPlayer = function (player) {
	this.players.set(UuidUtils.bytesToUuid(player.uuid), player);
	EventBus.dispatch(PlayerAddedEvent.NAME, this, new PlayerAddedEvent(this, player));
};

World.prototype.removePlayer = function (player) {
	this.players.delete(UuidUtils.bytesToUuid(player.uuid));
	EventBus.dispatch(PlayerRemovedEvent.NAME, this, new PlayerRemovedEvent(this, player));
};

/**
 * Loads the world.
 */
World.prototype.load = function () {
	if (!this.isLoaded) {
		if (Side.getSide() === Side.SERVER) {
			this.loopID = gameloop.setGameLoop(delta => this.updateTick(delta), 1000 / World.TICKS_PER_SEC);
		} else {
			this.initScene();
			this.camera.attachControl(this.mainInstance.canvas, false);
			const Loading = require('client/lib/dom/loading');
			this.htmlElementsToToggle.forEach(Loading.load);
		}
		EventBus.dispatch(WorldLoadedEvent.NAME, this, new WorldLoadedEvent(this));
	}
	this.isLoaded = true;
	return this;
};

/**
 * Unloads the world for changing/deletion.
 */
World.prototype.unload = function () {
	if (this.isLoaded) {
		if (Side.getSide() === Side.SERVER) {
			gameloop.clearGameLoop(this.loopID);
		} else {
			this.camera.detachControl(this.mainInstance.canvas);
			const Loading = require('client/lib/dom/loading');
			this.htmlElementsToToggle.forEach(Loading.unload);
			this.sceneElementsToDispose.forEach(el => el.dispose());
			this.sceneElementsToDispose.clear();
		}
		this.players.forEach((player) => player.despawn());
		this.players = new Map();
		
		this.nonPlayerEntities.forEach((entity) => entity.despawn());
		this.nonPlayerEntities = new Map();
		EventBus.dispatch(WorldUnloadedEvent.NAME, this, new WorldUnloadedEvent(this));
	}
	this.isLoaded = false;
	return this;
};

/**
 * The maximum absolute value of the x and y coordinates.
 */
World.prototype.getWorldSize = function () {
	return 130;
};

/**
 * Return the walls of the game world (other than the world boundary).
 * @return {Array.<Array.<Vec3>>}
 */
World.prototype.getWalls = function () {
	return [[new Vec3(10,0,10), new Vec3(10,0,110), new Vec3(120,0,110), new Vec3(120,0,50)],
		[new Vec3(-10,0,-10), new Vec3(-10,0,-110), new Vec3(-120,0,-110), new Vec3(-120,0,-50)],
		[new Vec3(-10,0,10), new Vec3(-10,0,110), new Vec3(-120,0,110), new Vec3(-120,0,50)],
		[new Vec3(10,0,-10), new Vec3(10,0,-110), new Vec3(120,0,-110), new Vec3(120,0,-50)],
		[new Vec3(10,0,0), new Vec3(130,0,50), new Vec3(130,0,-50)],
		[new Vec3(-10,0,0), new Vec3(-130,0,50), new Vec3(-130,0,-50)]
	];
};

/**
 *
 * @param {Vec3} src
 * @param {Vec3} dest
 * @return {number}
 */
World.prototype.rayTraceScaleFactor = function (src, dest) {
	let walls = this.getWalls();
	
	let ground = new Plane(new Vec3(0,1,0), new Vec3(0, -0.001, 0));
	
	let runningMinScaleFactor = ground.intersectLineScaleFactor(src, dest);
	if (!(0 <= runningMinScaleFactor && runningMinScaleFactor <= 1.001)) {
		runningMinScaleFactor = Infinity;
	}
	
	let boundarySize = this.getWorldSize();
	let outerBoundaries = [
		new Plane(new Vec3(1,0,0), new Vec3(-boundarySize,0,0)),
		new Plane(new Vec3(-1,0,0), new Vec3(boundarySize,0,0)),
		new Plane(new Vec3(0,0,1), new Vec3(0,0,-boundarySize)),
		new Plane(new Vec3(0,0,-1), new Vec3(0,0,boundarySize))
	];
	
	for (let outerBoundary of outerBoundaries) {
		let candidate = outerBoundary.intersectLineScaleFactor(src, dest);
		if (0 <= candidate && candidate <= 1.001) {
			runningMinScaleFactor = Math.min(runningMinScaleFactor, candidate);
		}
	}
	
	for (let wall of walls) {
		for (let i=0; i<wall.length; ++i) {
			let candidates = Vec3.intersectLinesScaleFactor(src, dest, wall[i], wall[(i+1) % wall.length], "xz");
			if (candidates.every(cand => (0 <= cand && cand <= 1.001))) {
				runningMinScaleFactor = Math.min(runningMinScaleFactor, candidates[0]);
			}
		}
	}
	
	return runningMinScaleFactor;
};

if (Side.getSide() === Side.CLIENT) {
	const BABYLON = require('babylonjs');
	const RenderManager = require('client/lib/render/render_manager');
	
	World.prototype.initScene = function () {
		this.scene = this.mainInstance.theScene;
		
		this.renderManager = this.mainInstance.renderManager;
		
		this.camera = new BABYLON.TargetCamera('camera', new BABYLON.Vector3(0,0,0), this.scene);
		this.sceneElementsToDispose.add(this.camera);
	};
	
	World.prototype.animate = function () {
		this.nonPlayerEntities.forEach(entity => entity.animate());
	};

	World.prototype.render = function () {
		this.nonPlayerEntities.forEach(entity => entity.render());
		this.players.forEach(player => player.render());
		if (this.scene) this.scene.render();
	};
} else {
	World.prototype.updateTick = function (delta) {
		++this.elapsedTicks;
		this.nonPlayerEntities.forEach(entity => entity.updateTick(delta));
		this.players.forEach(player => player.updateTick(delta));
	};
}

/**
 * The number of ticks per second.
 * @type {number}
 */
World.TICKS_PER_SEC = 20;

module.exports = World;