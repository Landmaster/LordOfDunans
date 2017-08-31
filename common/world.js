/**
 * @author Landmaster
 */

const Side = require('./lib/side');
const gameloop = require('node-gameloop');

/**
 * Create a new world.
 * @param {Server|Dunans} mainInstance mainInstance the server/client instance
 * @constructor
 */
function World(mainInstance) {
	this.mainInstance = mainInstance;

	if (Side.getSide() === Side.CLIENT) {
		const BABYLON = require('babylonjs');
		
		/**
		 * The frame that the world started in.
		 * @type {number}
		 */
		this.initialFrame = this.mainInstance.frame;
		
		/**
		 * @type {BABYLON.Scene}
		 */
		this.scene = new BABYLON.Scene(this.mainInstance.engine);
		this.scene.clearColor = new BABYLON.Color4(0,0,0);

		this.camera = new BABYLON.TargetCamera('camera', new BABYLON.Vector3(0,0,0), this.scene);
		
		/**
		 * Stores the HTML DOM elements to toggle display on load/unload. The array elements
		 * are either {@link Element}s or {@link Array}s each holding the {@link Element}, the
		 * load callback, and the unload callback respectively.
		 * @type {Array.<Element|Array>}
		 */
		this.htmlElementsToToggle = [];
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

/**
 * Loads the world.
 */
World.prototype.load = function () {
	if (Side.getSide() === Side.SERVER) {
		this.loopID = gameloop.setGameLoop(delta => this.updateTick(delta), 1000 / 20);
	} else {
		this.camera.attachControl(this.mainInstance.canvas, false);
		const Loading = require('client/lib/dom/loading');
		this.htmlElementsToToggle.forEach(Loading.load);
	}
};

/**
 * Unloads the world for changing/deletion.
 */
World.prototype.unload = function () {
	if (Side.getSide() === Side.SERVER) {
		gameloop.clearGameLoop(this.loopID);
	} else {
		this.camera.detachControl(this.mainInstance.canvas);
		const Loading = require('client/lib/dom/loading');
		this.htmlElementsToToggle.forEach(Loading.unload);
	}
	this.players = new Map();
	this.nonPlayerEntities = new Map();
};

if (Side.getSide() === Side.CLIENT) {
	World.prototype.animate = function () {
		this.nonPlayerEntities.forEach(entity => entity.animate());
	};

	World.prototype.render = function () {
		this.nonPlayerEntities.forEach(entity => entity.render());
		this.scene.render();
	};
} else {
	World.prototype.updateTick = function (delta) {
		++this.elapsedTicks;
	};
}

module.exports = World;