/**
 * @author Landmaster
 */

const BABYLON = require('babylonjs');
const UuidUtils = require('common/lib/uuid_utils');

/**
 *
 * @param {Player|Entity} playerOrEntity
 * @param {BABYLON.Scene} scene
 * @constructor
 * @augments {BABYLON.DynamicTexture}
 */
function HPBar(playerOrEntity, scene) {
	let canvas = document.createElement('canvas');
	canvas.width = canvas.height = 256;
	BABYLON.DynamicTexture.call(this, 'hp_bar_'+UuidUtils.bytesToUuid(playerOrEntity.uuid), canvas, scene);
	this.playerOrEntity = playerOrEntity;
	this.canvas = canvas;
	
	this.renderFn = () => {
		let ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, 256, 256);
		ctx.font = "24px Lato,sans-serif";
		ctx.textAlign = "center";
		ctx.fillStyle = "hsl("+( 120*(this.playerOrEntity.getCurHP() / this.playerOrEntity.getMaxHP()) )+",100%,50%)";
		ctx.fillText(this.playerOrEntity.getCurHP()+'/'+this.playerOrEntity.getMaxHP(), 128, 70);
		
		this.update();
	};
	
	scene.registerBeforeRender(this.renderFn);
}
HPBar.prototype = Object.create(BABYLON.DynamicTexture.prototype, {
	constructor: {
		value: HPBar,
		writable: true,
		configurable: true
	}
});

HPBar.prototype.dispose = function() {
	BABYLON.DynamicTexture.prototype.dispose.call(this);
	this.getScene().unregisterBeforeRender(this.renderFn);
};

module.exports = HPBar;