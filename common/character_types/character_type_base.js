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
	CharacterTypeBase.prototype.avatarImage = function () {
		return this.identifier ? "/assets/images/character_avatars/"+this.identifier+".png" : "";
	};
	
	CharacterTypeBase.prototype.model = function () {
		return this.identifier ? this.identifier+'.babylon' : '';
	};
	
	CharacterTypeBase.prototype.modelPromise = function (scene) {
		const BABYLON = require('babylonjs');
		
		let model = this.model();
		return model ? new Promise((res, rej) => {
			BABYLON.SceneLoader.ImportMesh(this.identifier,
				'/assets/models/characters/', model,
				scene, res, undefined, rej);
		}) : Promise.resolve(null);
	}
}

CharacterTypeBase.EMPTY = new CharacterTypeBase('');

module.exports = CharacterTypeBase;