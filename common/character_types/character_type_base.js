const Side = require('common/lib/side');
const Promise = require('bluebird');
const CharacterRegistry = require('common/character_registry');

/**
 * @author Landmaster
 * @constructor
 */
function CharacterTypeBase(identifier) {
	this.identifier = identifier;
	
	/**
	 * List of possible attacks
	 * @type {Map.<String, Function>}
	 */
	this.attacks = new Map();
}

if (Side.getSide() === Side.CLIENT) {
	const BABYLON = require('babylonjs');
	
	CharacterTypeBase.prototype.avatarImage = function () {
		return this.identifier ? "/assets/images/character_avatars/"+this.identifier+".png" : "";
	};
	
	CharacterTypeBase.prototype.model = function () {
		return this.identifier ? this.identifier+'.babylon' : '';
	};
	
	CharacterTypeBase.prototype.modelPromise = function (mainInstance) {
		let model = this.model();
		return model && mainInstance.theWorld.renderManager ?
			mainInstance.theWorld.renderManager.loadModel(this.identifier, '/assets/models/characters/', model)
			: Promise.resolve([]);
	};
}

CharacterTypeBase.prototype.maxWalkVelocity = function () {
	return 2;
};
/*
CharacterTypeBase.prototype.accelerationFactor = function () {
	return 0.1;
};
CharacterTypeBase.prototype.frictionFactor = function () {
	return 0.03;
};
*/

CharacterTypeBase.EMPTY = new CharacterTypeBase('');

module.exports = CharacterTypeBase;