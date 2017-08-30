const PacketHandler = require('common/packethandler_registrar');
const BABYLON = require('babylonjs');
const World = require('common/world');
const EmptyWorld = require('common/menu/empty_world');
require('client/lib/l10n_keys');

const getWS = path => (location.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + location.hostname
+ (location.port ? ':'+location.port : '') + path;

function Dunans() {
	/**
	 * @type {Array.<Function>}
	 */
	this.renderCallbacks = [];

	/**
	 * @type {WebSocket}
	 */
	this.ws = new WebSocket(getWS('/socket'));
	this.ws.binaryType = 'arraybuffer';

	this.ws.addEventListener('message', event => {
		PacketHandler.handle(event.data, this, { ws: this.ws });
	});
	
	this.messageQueue = [];
	
	this.ws.addEventListener('open', event => {
		while (this.messageQueue > 0) {
			const message = this.messageQueue[0];
			if (this.sendToServer(message, true)) {
				this.messageQueue.shift();
			} else {
				break;
			}
		}
	});
	
	this.ws.addEventListener('close', event => {
		console.error('WebSocket unexpectedly closed:\n'+event);
		this.ws = null;
		setTimeout(() => (this.ws = new WebSocket(getWS('/socket'))), 500);
	});

	this.canvas = document.getElementById('canvas');

	this.engine = new BABYLON.Engine(this.canvas, true, {}, true);

	this.frame = 0;
	
	this.toggleLoginCSS = document.getElementById('toggle_login');

	this.theWorld = null;
	
	this.thePlayer = null;

	this.setWorld(new EmptyWorld(this));
	
	this.refreshUserDisplay();

	this.renderCallbacks.push(() => {
		this.theWorld.animate();
		this.theWorld.render();
	});

	const render = () => {
		++this.frame;
		this.renderCallbacks.forEach(callback => callback(this));
	};

	this.engine.runRenderLoop(render);

	window.addEventListener("resize", () => this.engine.resize());
}

Dunans.prototype.refreshUserDisplay = function () {
	const elements = document.getElementsByClassName('inject_uname');
	const uname = this.getUsername();
	if (uname) {
		this.toggleLoginCSS.innerHTML = ".log_off{display:none;}";
	} else {
		this.toggleLoginCSS.innerHTML = ".log_on{display:none;}";
	}
	for (let i=0; i<elements.length; ++i) {
		if (uname) {
			elements[i].textContent = uname;
		} else {
			elements[i].innerHTML = "";
		}
	}
};

Dunans.prototype.getUsername = function () {
	return this.thePlayer ? this.thePlayer.uname : null;
};

Dunans.prototype.setWorld = function setWorld(world) {
	if (this.theWorld) this.theWorld.unload();
	this.theWorld = world;
	if (world) world.load();
};

Dunans.prototype.setPlayer = function setPlayer(player) {
	if (this.thePlayer) this.thePlayer.despawn();
	this.thePlayer = player;
	if (this.thePlayer) this.thePlayer.spawn(this.theWorld);
	this.refreshUserDisplay();
};

Dunans.prototype.sendToServer = function sendToServer(message, noPush) {
	if (this.ws) {
		this.ws.send(PacketHandler.stream(message));
		return true;
	} else if (!noPush) {
		this.messageQueue.push(message);
		return false;
	}
};

module.exports = Dunans;