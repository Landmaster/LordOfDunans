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

/**
 *
 * @param mainInstance
 * @constructor
 */
function GameWorld(mainInstance) {
	World.call(this, mainInstance);
	if (Side.getSide() === Side.CLIENT) {
		this.updatePlayerRotation = (e) => {
			this.mainInstance.thePlayer.yaw -= e.movementX / 130;
			this.mainInstance.thePlayer.pitch -= e.movementY / 130;
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
	};
	
	GameWorld.prototype.render = function () {
		World.prototype.render.call(this);
		
		this.camera.position = this.mainInstance.thePlayer.pos
			.addTriple(0, this.mainInstance.thePlayer.getEyeHeight(), 0).toBabylon();
		
		let yaw = this.mainInstance.thePlayer.yaw,
			pitch = this.mainInstance.thePlayer.pitch;
		this.camera.setTarget(new BABYLON.Vector3(
			Math.cos(yaw)*Math.cos(pitch),
			Math.sin(pitch),
			Math.sin(yaw)*Math.cos(pitch))
			.add(this.camera.position));
	}
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
	}
}

EventBus.addEventListener(PlayerAddedEvent.NAME, (ev, data) => {
	if (data.world instanceof GameWorld) {
		// set initial positions
		data.player.setPositionAndUpdate(new Vec3(0,0,-100 + 200*data.player.index));
		data.player.setRotationAndUpdate(Math.PI * (data.player.index+0.5),0);
	}
});

module.exports = GameWorld;