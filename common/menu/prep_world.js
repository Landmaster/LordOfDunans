/**
 * @author Landmaster
 */

const World = require('common/world');
const Side = require('common/lib/side');
const EventBus = require('eventbusjs');
const PlayerAddedEvent = require('common/events/player_added');
const PlayerRemovedEvent = require('common/events/player_removed');

/**
 * 
 * @param {Server|Dunans} mainInstance the main instance
 * @constructor
 */
function PreparationWorld(mainInstance) {
	World.call(this, mainInstance);
	if (Side.getSide() === Side.CLIENT) {
		this.initScene();
	}
}

PreparationWorld.prototype = Object.create(World.prototype, {
	constructor: {
		value: PreparationWorld,
		writable: true,
		configurable: true
	}
});

if (Side.getSide() === Side.CLIENT) {
	PreparationWorld.prototype.initScene = function () {
		const BABYLON = require('babylonjs');
		
		// setup camera
		this.camera.position = new BABYLON.Vector3(13,5,0);
		this.camera.setTarget(BABYLON.Vector3.Zero());
		
		// for the ground
		this.ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 128, height: 128}, this.scene);
		const groundMat = new BABYLON.StandardMaterial("ground_mat", this.scene);
		groundMat.diffuseColor = new BABYLON.Color3(0, 0.6, 0);
		this.ground.material = groundMat;
		
		// lights on!
		this.light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(-1, 1, 0), this.scene);
		this.light.intensity = 0.5;
		
		this.matchReview = document.getElementById("match_review");
		
		this.htmlElementsToToggle.push(this.matchReview);
	};
	
	const playerUpdateHandler = function (ev, data) {
		if (data.world instanceof PreparationWorld) {
			console.log(data.world.players);
		}
	};
	
	EventBus.addEventListener(PlayerAddedEvent.NAME, playerUpdateHandler);
	EventBus.addEventListener(PlayerRemovedEvent.NAME, playerUpdateHandler);
}

module.exports = PreparationWorld;