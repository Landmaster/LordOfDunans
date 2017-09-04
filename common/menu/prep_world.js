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
		
		/**
		 * Match review HTML div.
		 * @type {Element}
		 */
		this.matchReview = document.getElementById("match_review");
		
		this.htmlElementsToToggle.push(this.matchReview);
		
		this._updateMatchReview();
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
	};
	
	/**
	 * Updates the match review GUI with the players.
	 * @private
	 */
	PreparationWorld.prototype._updateMatchReview = function () {
		this.matchReview.innerHTML = ""; // reset the element
		if (this.players.size >= 2) {
			let counter = 0;
			for (let player of this.players.values()) {
				if (++counter > 2) break;
				
				let _playerBody = document.createElement("div");
				_playerBody.classList.add("player_review");
				
				let _nameReview = document.createElement("h2");
				_nameReview.classList.add("name_review");
				_nameReview.textContent = player.uname;
				_playerBody.appendChild(_nameReview);
				
				this.matchReview.appendChild(_playerBody); // Only append the element at the end, to minimize the amount of needed DOM updates.
			}
		} else {
			let _loadingMeter = document.createElement("div");
			_loadingMeter.classList.add("loading_meter");
			
			let _loadingCircle = document.createElement("img");
			_loadingCircle.src = "/assets/images/loading.svg";
			_loadingMeter.appendChild(_loadingCircle);
			
			this.matchReview.appendChild(_loadingMeter);
		}
	};
	
	const playerUpdateHandler = function (ev, data) {
		if (data.world instanceof PreparationWorld) {
			data.world._updateMatchReview();
		}
	};
	
	EventBus.addEventListener(PlayerAddedEvent.NAME, playerUpdateHandler);
	EventBus.addEventListener(PlayerRemovedEvent.NAME, playerUpdateHandler);
}

module.exports = PreparationWorld;