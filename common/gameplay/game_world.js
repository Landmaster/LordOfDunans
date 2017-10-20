/**
 * @author Landmaster
 */

const World = require('common/world');
const Side = require("common/lib/side");
const EventBus = require('eventbusjs');
const PlayerAddedEvent = require("common/events/player_added");
const Vec3 = require('common/math/vec3');

/**
 *
 * @param mainInstance
 * @constructor
 */
function GameWorld(mainInstance) {
	World.call(this, mainInstance);
}

GameWorld.prototype = Object.create(World.prototype, {
	constructor: {
		value: GameWorld,
		writable: true,
		configurable: true
	}
});

if (Side.getSide() === Side.CLIENT) {
	const BABYLON = require('babylonjs');
	
	GameWorld.prototype.initScene = function () {
		World.prototype.initScene.call(this);
		
		// setup camera
		this.camera.position = new BABYLON.Vector3(13,5,0);
		this.camera.setTarget(BABYLON.Vector3.Zero());
		
		this.light = new BABYLON.HemisphericLight("hemisphere", new BABYLON.Vector3(0,1,0), this.scene);
		this.light.diffuse = new BABYLON.Color3(1, 1, 1);
		this.light.specular = new BABYLON.Color3(1, 1, 1);
		this.light.groundColor = new BABYLON.Color3(0, 0, 0);
		this.sceneElementsToDispose.add(this.light);
		
		// for the ground
		this.ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 128, height: 128}, this.scene);
		const groundMat = new BABYLON.StandardMaterial("ground_mat", this.scene);
		groundMat.diffuseColor = new BABYLON.Color3(0, 0.6, 0);
		this.ground.material = groundMat;
		this.sceneElementsToDispose.add(this.ground);
	}
}

EventBus.addEventListener(PlayerAddedEvent.NAME, (ev, data) => {
	if (data.world instanceof GameWorld) {
		data.player.setPositionAndUpdate(new Vec3(0,0,-7 + 14*data.player.index));
	}
});

module.exports = GameWorld;