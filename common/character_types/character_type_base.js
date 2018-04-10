const Side = require('common/lib/side');
const Promise = require('bluebird');
const CharacterRegistry = require('common/character_registry');
const AABB = require('common/math/aabb');
const Vec3 = require('common/math/vec3');
const Types = require('common/types/types');
const AttackSlotManager = require('common/attacks/attack_slot_manager');

/**
 * @author Landmaster
 * @constructor
 */
function CharacterTypeBase(identifier) {
	this.identifier = identifier;
}

// TODO add learnset specs
/**
 *
 * @param cdata
 * @return {Array.<Function>}
 */
CharacterTypeBase.prototype.learnSet = function (cdata) {
	return [];
};

// TODO add base stat specs
CharacterTypeBase.prototype.baseStats = function (cdata) {
	return {
		HP: {val: 5000, incr: 350},
		Atk1: {val: 5000, incr: 350},
		Def1: {val: 5000, incr: 350},
		Atk2: {val: 5000, incr: 350},
		Def2: {val: 5000, incr: 350},
		Atk3: {val: 5000, incr: 350},
		Def3: {val: 5000, incr: 350},
		Atk4: {val: 5000, incr: 350},
		Def4: {val: 5000, incr: 350},
		Atk5: {val: 5000, incr: 350},
		Def5: {val: 5000, incr: 350},
		Atk6: {val: 5000, incr: 350},
		Def6: {val: 5000, incr: 350},
	}
};

/**
 *
 * @param cdata
 * @return {number}
 */
CharacterTypeBase.prototype.maxHP = function (cdata) {
	return this.baseStats(cdata).HP.val;
};

CharacterTypeBase.prototype.matchup = function (cdata) {
	return {
		Normal: 1,
		Fire: 1,
		Water: 1,
		Soul: 1,
		Martial: 1,
		Psyche: 1,
		Air: 1,
		Earth: 1,
		Electric: 1,
		Light: 1,
		Darkness: 1,
		Cosmic: 1,
		Fairy: 1,
		Metal: 1,
		Flora: 1,
		Poison: 1,
		Ice: 1,
	};
};

/**
 *
 * @return {Array.<AABB>}
 */
CharacterTypeBase.prototype.getBoundingBoxes = function (cdata) {
	return [new AABB(new Vec3(-1,0,-1), new Vec3(1,4,1))];
};

CharacterTypeBase.prototype.height = function (cdata) {
	return 4;
};

if (Side.getSide() === Side.CLIENT) {
	const BABYLON = require('babylonjs');
	
	CharacterTypeBase.prototype.avatarImage = function () {
		return this.identifier ? "/assets/images/character_avatars/"+this.identifier+".png" : "";
	};
	
	CharacterTypeBase.prototype.model = function () {
		return this.identifier ? this.identifier+'.babylon' : '';
	};
	
	CharacterTypeBase.prototype.modelPromise = function (mainInstance, cdata) {
		let model = this.model();
		return model && mainInstance.theWorld.renderManager ?
			mainInstance.theWorld.renderManager.loadModel(this.identifier, '/assets/models/characters/', model)
			: Promise.resolve([]);
	};
}

CharacterTypeBase.prototype.maxWalkVelocity = function () {
	return 5.2;
};

/**
 * @param {Player} player
 * @return {CharacterTypeBase.CharacterData}
 */
CharacterTypeBase.prototype.createCharacterData = function (player) {
	return new (this.constructor.CharacterData || CharacterTypeBase.CharacterData)(player);
};

/**
 * Class for storing character-specific data for a player.
 * @param {Player} player
 * @constructor
 */
CharacterTypeBase.CharacterData = function (player) {
	this.player = player;
	
	/**
	 *
	 * @type {AttackSlotManager}
	 */
	this.attackManager = new AttackSlotManager();
	
	/**
	 *
	 * @type {?AttackBase}
	 */
	this.currentAttack = null;
};
CharacterTypeBase.CharacterData.prototype.toBSON = function () {
	let copy = Object.assign({}, this);
	delete copy.player;
	return copy;
};
CharacterTypeBase.CharacterData.prototype.fromBSON = function (bson) {
	Object.assign(this, bson);
};


CharacterTypeBase.EMPTY = new CharacterTypeBase('');

module.exports = CharacterTypeBase;