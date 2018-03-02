/**
 * @author Landmaster
 */

'use strict';

const sprintf = require('sprintf-js').sprintf;
const Side = require('common/lib/side');
const World = require('common/world');
const Packet = require('common/lib/packet');

const CharacterTypeBase = require('common/character_types/character_type_base');

const EventBus = require('eventbusjs');
const PlayerAddedEvent = require('common/events/player_added');

/**
 * The empty world, used for the title screen.
 * @param {Server|Dunans} mainInstance the server/client instance
 * @constructor
 */
function EmptyWorld(mainInstance) {
	World.call(this, mainInstance);
	if (Side.getSide() === Side.CLIENT) {
		/**
		 * @type {Array.<string>}
		 */
		this.loginErrors = [];
		
		const openLoginDialog = this.openLRDialog.bind(this, false);
		const openRegisterDialog = this.openLRDialog.bind(this, true);
		const openLogoutDialog = () => {
			this.mainInstance.sendToServer(new Packet.logoutPacket());
		};
		
		const Loading = require('client/lib/dom/loading');
		
		// handle the title
		this.title = document.getElementById('title');
		const fadeIn = require('client/lib/dom/fade_in');
		this.htmlElementsToToggle.push([this.title, e => {
			Loading.default_html_load(e); fadeIn(e, 1100);
		}]);
		
		// menu options
		this.titleOptions = document.getElementById('title_options');
		
		this.playOption = document.getElementById('play_option');
		const play = this.play.bind(this);
		
		this.htmlElementsToToggle.push([this.titleOptions, e => {
			Loading.default_html_load(e); fadeIn(e, 1100);
			this.playOption.addEventListener("click", play, false);
		}, e => {
			Loading.default_html_unload(e);
			this.playOption.removeEventListener("click", play);
		}]);
		
		// and buttons
		this.buttonBar = document.getElementById('button_bar');
		
		this.loginButton = document.getElementById('login_button');
		this.registerButton = document.getElementById('register_button');
		this.logoutButton = document.getElementById('logout_button');
		
		this.htmlElementsToToggle.push([this.buttonBar, e => {
			Loading.default_html_load(e);
			this.loginButton.addEventListener("click", openLoginDialog, false);
			this.registerButton.addEventListener("click", openRegisterDialog, false);
			this.logoutButton.addEventListener("click", openLogoutDialog, false);
		}, e => {
			Loading.default_html_unload(e);
			this.loginButton.removeEventListener("click", openLoginDialog);
			this.registerButton.removeEventListener("click", openRegisterDialog);
			this.logoutButton.removeEventListener("click", openLogoutDialog);
		}]);
	}
}

EmptyWorld.prototype = Object.create(World.prototype, {
	constructor: {
		value: EmptyWorld,
		writable: true,
		configurable: true
	}
});

if (Side.getSide() === Side.CLIENT) {
	EmptyWorld.prototype.play = function () {
		this.mainInstance.sendToServer(new Packet.playPacket());
		
		const PreparationWorld = require('./prep_world');
		
		const newWorld = new PreparationWorld(this.mainInstance);
		if (this.mainInstance.thePlayer) {
			this.mainInstance.thePlayer.despawn(this.mainInstance.theWorld);
			this.mainInstance.setWorld(newWorld);
			this.mainInstance.thePlayer.spawn(newWorld);
		}
		this.mainInstance.setWorld(newWorld); // if called a 2nd time, does nothing
	};
	
	EmptyWorld.prototype.openLRDialog = function (isRegister)  {
		const vex = require('vex-js');
		const escapeHtml = require('client/lib/dom/escape_html');
		vex.dialog.open({
			unsafeMessage: [
				escapeHtml((isRegister ? '$gui_register' : '$gui_login').toLocaleString())
			].concat(this.loginErrors.map(
				error => sprintf('<span class="login_error">%s</span>', escapeHtml(error)))
			).join('<br />'),
			input: [
				sprintf('<input name="uname" type="text" placeholder="%s" required />', escapeHtml("$data_username".toLocaleString())),
				sprintf('<input name="pword" type="password" placeholder="%s" required />', escapeHtml("$data_password".toLocaleString()))
			].concat(isRegister ? [
				sprintf('<input name="pword_conf" type="password" placeholder="%s" required />', escapeHtml("$data_password_confirm".toLocaleString()))
			] : []).join('\n'),
			buttons: [
				Object.assign({}, vex.dialog.buttons.YES, { text: (isRegister ? '$gui_register' : '$gui_login').toLocaleString() }),
				Object.assign({}, vex.dialog.buttons.NO, { text: '$gui_back'.toLocaleString() })
			],
			callback: data => {
				if (data) {
					if (isRegister) {
						this.loginErrors = [];
						if (data.pword !== data.pword_conf) {
							this.loginErrors.push('$error_unconfirmed_password'.toLocaleString());
							this.openLRDialog(isRegister);
						} else {
							this.mainInstance.sendToServer(new Packet.registerPacket(data.uname, data.pword));
						}
					} else {
						this.mainInstance.sendToServer(new Packet.loginPacket(data.uname, data.pword));
					}
				}
			}
		});
	};
	
	EmptyWorld.prototype.initScene = function () {
		World.prototype.initScene.call(this);
		
		const BABYLON = require('babylonjs');
		
		// setup camera
		this.camera.position = new BABYLON.Vector3(13,5,0);
		this.camera.setTarget(BABYLON.Vector3.Zero());
		
		// for the ground
		this.ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 1024, height: 1024}, this.scene);
		const groundMat = new BABYLON.StandardMaterial("ground_mat", this.scene);
		groundMat.diffuseColor = new BABYLON.Color3(0, 0.6, 0);
		this.ground.material = groundMat;
		this.sceneElementsToDispose.add(this.ground);
		
		// lights on!
		this.light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(-1, 1, 0), this.scene);
		this.light.intensity = 0.5;
		this.sceneElementsToDispose.add(this.light);
		
		// the crystals in the center
		this.crystalArray = null;
		this.renderManager.loadModel('Crystal Array', '/assets/models/', 'crystalarray.babylon').spread((meshes) => {
			this.crystalArray = meshes[0].clone('crystal_array');
			this.crystalArray.isVisible = true;
			this.crystalArray.position = BABYLON.Vector3.Zero();
			this.crystalArray.scaling = new BABYLON.Vector3(0.8, 0.8, 0.8);
			this.sceneElementsToDispose.add(this.crystalArray);
		});
		
		// side towers
		this.cylinders = new Array(2);
		
		this.cylinders[0] = BABYLON.MeshBuilder.CreateCylinder('cylinder0', {height: 6, diameter: 1}, this.scene);
		const cylinderMat = new BABYLON.StandardMaterial('cylinder_mat', this.scene);
		cylinderMat.diffuseColor = new BABYLON.Color3(0.7, 0, 0.3);
		cylinderMat.emissiveColor = new BABYLON.Color3(0.7, 0, 0.3);
		cylinderMat.emissiveIntensity = 0.2;
		this.cylinders[0].material = cylinderMat;
		
		this.cylinders[1] = this.cylinders[0].clone('cylinder1');
		
		this.cylinders[0].position = new BABYLON.Vector3(0, 3, -6);
		this.cylinders[1].position = new BABYLON.Vector3(0, 3, +6);
		
		this.cylinders.forEach((cyl) => this.sceneElementsToDispose.add(cyl));
		
		// glass for lights
		this.lampGlass = new Array(2);
		
		this.lampGlass[0] = BABYLON.MeshBuilder.CreatePolyhedron('lamp_glass0', {type: 1, size: 0.75}, this.scene);
		const lampGlassMat = new BABYLON.StandardMaterial('lamp_glass_mat', this.scene);
		lampGlassMat.alpha = 0.6;
		lampGlassMat.diffuseColor = new BABYLON.Color3(0.046, 0, 0.16);
		lampGlassMat.emissiveColor = new BABYLON.Color3(0.23, 0, 0.8);
		lampGlassMat.emissiveIntensity = 0.55;
		lampGlassMat.indexOfRefraction = 1.8;
		lampGlassMat.specularColor = new BABYLON.Color3(0.23, 0, 0.8);
		lampGlassMat.specularPower = 0.7;
		lampGlassMat.backFaceCulling = false;
		this.lampGlass[0].material = lampGlassMat;
		
		this.lampGlass[1] = this.lampGlass[0].clone('lamp_glass1');
		
		this.lampGlass[0].position = new BABYLON.Vector3(0, 7.5, -6);
		this.lampGlass[1].position = new BABYLON.Vector3(0, 7.5, +6);
		
		this.lampGlass.forEach(gls => this.sceneElementsToDispose.add(gls));
		
		this.lampGlassLights = new Array(2);
		for (let i=0; i<this.lampGlassLights.length; ++i) {
			this.lampGlassLights[i] = new BABYLON.PointLight('lamp_glass_light'+i, this.lampGlass[i].position, this.scene);
		}
		this.lampGlassLights.forEach(lgl => this.sceneElementsToDispose.add(lgl));
	};
	
	EmptyWorld.prototype.animate = function () {
		World.prototype.animate.call(this);
		if (this.crystalArray) {
			this.crystalArray.rotation.y = (this.mainInstance.frame * 0.006) % (2 * Math.PI);
		}
		this.light.intensity = 0.6 + 0.23 * Math.sin(this.mainInstance.frame * 0.01);
		if (this.lampGlass) {
			this.lampGlass.forEach(glass => glass.rotation.y = (this.mainInstance.frame * -0.009) % (2 * Math.PI));
		}
	};
}

const playerUpdateHandler = function (ev, data) {
	if (data.world instanceof EmptyWorld) {
		if (data instanceof PlayerAddedEvent) {
			data.player.setCharacterType(CharacterTypeBase.EMPTY);
			data.player.clearChosenTowers();
		}
	}
};

EventBus.addEventListener(PlayerAddedEvent.NAME, playerUpdateHandler);

module.exports = EmptyWorld;