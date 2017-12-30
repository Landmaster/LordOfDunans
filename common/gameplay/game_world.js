/**
 * @author Landmaster
 */

const World = require('common/world');
const Side = require("common/lib/side");
const EventBus = require('eventbusjs');
const PlayerAddedEvent = require("common/events/player_added");
const Vec3 = require('common/math/vec3');
const Directions = require('common/lib/directions');
const Packet = require('common/lib/packet');
const PacketHandler = require("common/lib/packethandler");
const EntityRegistry = require('common/entity_registry');
const EntityKeys = require('common/entities/entity_keys');
const Ops = require('common/math/ops');

/**
 *
 * @param mainInstance
 * @constructor
 */
function GameWorld(mainInstance) {
	World.call(this, mainInstance);
	if (Side.getSide() === Side.CLIENT) {
		const Loading = require("client/lib/dom/loading");
		
		this.updatePlayerRotation = (e) => {
			this.mainInstance.thePlayer.yaw -= e.movementX / 130;
			this.mainInstance.thePlayer.pitch -= e.movementY / 130;
			this.mainInstance.thePlayer.pitch = Ops.clamp(this.mainInstance.thePlayer.pitch, -1.57, 1.57);
		};
		this.canvasClick = (e) => {
			this.mainInstance.canvas.requestPointerLock = this.mainInstance.canvas.requestPointerLock || this.mainInstance.canvas.mozRequestPointerLock;
			this.mainInstance.canvas.requestPointerLock();
			document.addEventListener('pointerlockchange', this.lockChange, false);
			document.addEventListener('mozpointerlockchange', this.lockChange, false);
		};
		this.lockChange = (e) => {
			if (document.pointerLockElement === this.mainInstance.canvas ||
				document.mozPointerLockElement === this.mainInstance.canvas) {
				document.addEventListener("mousemove", this.updatePlayerRotation, false);
			} else {
				document.removeEventListener("mousemove", this.updatePlayerRotation, false);
			}
		};
		this.crystalBar = document.getElementById("crystal_bar");
		this.announcementBar = document.getElementById("announcement_bar");
		this.entityBar = document.getElementById("entity_bar");
		
		this.htmlElementsToToggle.push(this.crystalBar,
			[this.entityBar, (e) => {
				Loading.default_html_load(e);
				e.innerHTML = "";
				this.mainInstance.thePlayer.chosenTowers.forEach((entityFn, idx) => {
					let indicator = document.createElement("div");
					indicator.classList.add("tower_bar_indicator");
					indicator.dataset.entity = EntityRegistry.entityClassToId(entityFn);
					indicator.dataset.key = EntityKeys[idx];
					
					let icon = document.createElement("img");
					icon.classList.add("tower_bar_icon");
					icon.src = entityFn.prototype.towerIcon;
					indicator.appendChild(icon);
					
					this.entityBar.appendChild(indicator);
				});
			}],
			[this.announcementBar, (e) => { Loading.default_html_load(e); e.innerHTML = ""; }]);
	}
}

GameWorld.prototype = Object.create(World.prototype, {
	constructor: {
		value: GameWorld,
		writable: true,
		configurable: true
	}
});

GameWorld.prototype.load = function () {
	World.prototype.load.call(this);
	if (Side.getSide() === Side.CLIENT) {
		const Mousetrap = require('mousetrap');
		
		// add key bindings for movement
		for (let dir of Directions.getDirections()) {
			Mousetrap.bind(Directions.getKeyForDirection(dir), (e) => {
				if (!this.mainInstance.thePlayer.movementDirections.has(dir)) {
					this.mainInstance.thePlayer.movementDirections.add(dir);
					this.mainInstance.sendToServer(new Packet.controlPlayerPacket(dir, false));
				}
				return false;
			}, 'keydown');
			Mousetrap.bind(Directions.getKeyForDirection(dir), (e) => {
				if (this.mainInstance.thePlayer.movementDirections.has(dir)) {
					this.mainInstance.thePlayer.movementDirections.delete(dir);
					this.mainInstance.sendToServer(new Packet.controlPlayerPacket(dir, true));
				}
				return false;
			}, 'keyup');
		}
		
		EntityKeys.forEach((key, idx) => {
			Mousetrap.bind(key, (e) => {
				this.mainInstance.sendToServer(new Packet.summonEntityPacket(idx));
				return false;
			});
		});
		
		this.mainInstance.canvas.addEventListener("click", this.canvasClick);
	}
	return this;
};
GameWorld.prototype.unload = function () {
	World.prototype.unload.call(this);
	if (Side.getSide() === Side.CLIENT) {
		const Mousetrap = require('mousetrap');
		
		// release key bindings for movement
		for (let dir of Directions.getDirections()) {
			Mousetrap.unbind(Directions.getKeyForDirection(dir));
		}
		
		EntityKeys.forEach((key) => {
			Mousetrap.unbind(key);
		});
		
		this.mainInstance.canvas.removeEventListener("click", this.canvasClick);
		document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
		document.exitPointerLock();
		document.removeEventListener('pointerlockchange', this.lockChange, false);
		document.removeEventListener('mozpointerlockchange', this.lockChange, false);
	}
	return this;
};

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
		this.ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 1024, height: 1024}, this.scene);
		const groundMat = new BABYLON.StandardMaterial("ground_mat", this.scene);
		groundMat.diffuseTexture = new BABYLON.Texture("/assets/images/character_avatars/landmaster.png", this.scene);
		groundMat.diffuseTexture.uScale = 64;
		groundMat.diffuseTexture.vScale = 64;
		this.ground.material = groundMat;
		this.sceneElementsToDispose.add(this.ground);
		
		this.crossHairManager = new BABYLON.SpriteManager("cross_hair_manager", "/assets/images/icons/cross_hair.svg", 1, 256, this.scene);
		this.crossHair = new BABYLON.Sprite("cross_hair", this.crossHairManager);
		this.crossHair.size = 0.1;
		this.sceneElementsToDispose.add(this.crossHair);
		
		this.walls = [];
		
		let wallMaterial = new BABYLON.StandardMaterial("wall_mat", this.scene);
		wallMaterial.diffuseColor = new BABYLON.Color3(0,0,0.6);
		
		let walls = this.getWalls();
		walls.forEach((wallDesc, idx) => {
			let newWallDesc = wallDesc.map(vec => vec.switchedOrder("zxy").toBabylon());
			newWallDesc.push(newWallDesc[0]);
			let wall = BABYLON.MeshBuilder.ExtrudeShape("wall"+idx, {
				shape: newWallDesc,
				path: [new BABYLON.Vector3(0,0.001,0), new BABYLON.Vector3(0,7,0)],
				cap: BABYLON.Mesh.CAP_ALL,
				sideOrientation: BABYLON.Mesh.DOUBLESIDE
			}, this.scene);
			wall.material = wallMaterial;
			this.sceneElementsToDispose.add(wall);
			this.walls.push(wall);
		});
		
		let bounds = this.getWorldSize();
		
		this.boundary = BABYLON.MeshBuilder.ExtrudeShape("boundary", {
			shape: [new BABYLON.Vector3(bounds, bounds, 0),
				new BABYLON.Vector3(-bounds, bounds, 0),
				new BABYLON.Vector3(-bounds, -bounds, 0),
				new BABYLON.Vector3(bounds, -bounds, 0),
				new BABYLON.Vector3(bounds, bounds, 0)],
			path: [new BABYLON.Vector3(0,0.001,0), new BABYLON.Vector3(0,20,0)],
			cap: BABYLON.Mesh.NO_CAP,
			sideOrientation: BABYLON.Mesh.DOUBLESIDE
		});
		this.boundary.material = wallMaterial;
		this.sceneElementsToDispose.add(this.boundary);
	};
	
	GameWorld.prototype.render = function () {
		World.prototype.render.call(this);
		
		this.camera.position = this.mainInstance.thePlayer.pos
			.addTriple(0, this.mainInstance.thePlayer.getEyeHeight(), 0).toBabylon();
		
		let targetDir = this.mainInstance.thePlayer.getLookVec();
		
		this.camera.setTarget(this.camera.position.add(targetDir.toBabylon()));
		
		this.crossHair.position = this.camera.position.add(targetDir.scale(1.01).toBabylon());
	};
	
	/**
	 * Post a message for the game.
	 * @param {string} message the message
	 */
	GameWorld.prototype.addMessage = function (message) {
		let wasScrolledToBottom = this.announcementBar.scrollHeight - this.announcementBar.clientHeight <= this.announcementBar.scrollTop + 2;
		let isUsingPointerLock = document.pointerLockElement === this.mainInstance.canvas ||
			document.mozPointerLockElement === this.mainInstance.canvas;
		
		let msgDiv = document.createElement("div");
		msgDiv.classList.add("message");
		msgDiv.textContent = message;
		this.announcementBar.appendChild(msgDiv);
		if (wasScrolledToBottom || isUsingPointerLock) {
			this.announcementBar.scrollTop = this.announcementBar.scrollHeight;
		}
	};
} else {
	GameWorld.prototype.updateTick = function (delta) {
		World.prototype.updateTick.call(this, delta);
		if (!(this.elapsedTicks % 3)) {
			let packets = [];
			for (let player of this.players.values()) {
				packets.push(new Packet.playerPositionPacket(player.uuid, player.pos),
					new Packet.playerVelocityPacket(player.uuid, player.velocity));
			}
			for (let player of this.players.values()) {
				packets.forEach(pkt => PacketHandler.sendToEndpoint(pkt, player.ws));
			}
		}
		
		// Distribute crystals every second
		if (!(this.elapsedTicks % 20)) {
			for (let player of this.players.values()) {
				for (let crystalName in player.crystals) {
					if (player.crystals.hasOwnProperty(crystalName)) {
						player.crystals[crystalName] += 10;
					}
				}
				PacketHandler.sendToEndpoint(new Packet.updateCrystalPacket(player.uuid, player.crystals), player.ws);
			}
		}
	}
}

EventBus.addEventListener(PlayerAddedEvent.NAME, (ev, data) => {
	if (data.world instanceof GameWorld) {
		// set initial positions
		data.player.setPositionAndUpdate(new Vec3(0,0,-125 + (2*125)*data.player.index));
		data.player.setRotationAndUpdate(Math.PI * (data.player.index+0.5),0);
	}
});

module.exports = GameWorld;