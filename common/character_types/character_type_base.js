const Side = require('common/lib/side');
const Promise = require('bluebird');
const CharacterRegistry = require('common/character_registry');
const AABB = require('common/math/aabb');
const Vec3 = require('common/math/vec3');

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

// TODO add learnset specs
Object.defineProperty(CharacterTypeBase.prototype, "learnSet", {
	value: null
});

// TODO add base stat specs
CharacterTypeBase.prototype.baseStats = function () {
	return {
		HP: 100,
		Atk1: 100,
		Def1: 100,
		Atk2: 100,
		Def2: 100,
		Atk3: 100,
		Def3: 100,
		Atk4: 100,
		Def4: 100,
		Atk5: 100,
		Def5: 100,
		Atk6: 100,
		Def6: 100,
	}
};

/**
 *
 * @return {Array.<AABB>}
 */
CharacterTypeBase.prototype.getBoundingBoxes = function () {
	return [new AABB(new Vec3(-1,0,-1), new Vec3(1,4,1))];
};

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
	return 5.2;
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