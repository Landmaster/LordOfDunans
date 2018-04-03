/**
 * @author Landmaster
 */

const CharacterTypeBase = require('./character_type_base');
const PlasmaWhip = require('common/attacks/common/plasma_whip');
//const Side = require('common/lib/side');

/**
 * Yours truly.
 * @constructor
 */
function CharacterLandmaster() {
	CharacterTypeBase.call(this, 'landmaster');
}
CharacterLandmaster.prototype = Object.create(CharacterTypeBase.prototype, {
	constructor: {
		value: CharacterLandmaster,
		writable: true,
		configurable: true
	}
});

CharacterTypeBase.prototype.learnSet = function (cdata) {
	return [PlasmaWhip];
};

CharacterLandmaster.prototype.baseStats = function (cdata) {
	return {
		HP: {val: 5749, incr: 557},
		Atk1: {val: 2017, incr: 347},
		Def1: {val: 4909, incr: 449},
		Atk2: {val: 9491, incr: 937},
		Def2: {val: 3779, incr: 331},
		Atk3: {val: 1259, incr: 257},
		Def3: {val: 6899, incr: 829},
		Atk4: {val: 2017, incr: 347},
		Def4: {val: 4909, incr: 449},
		Atk5: {val: 1259, incr: 257},
		Def5: {val: 6899, incr: 829},
		Atk6: {val: 8887, incr: 727},
		Def6: {val: 3943, incr: 331},
	}
};

CharacterLandmaster.prototype.matchup = function (cdata) {
	return {
		Normal: 1,
		Fire: 1,
		Water: 1,
		Soul: 0.6,
		Martial: 1.2,
		Psyche: 0.81,
		Air: 1.1,
		Earth: 0.86,
		Electric: 0.93,
		Light: 0.6,
		Darkness: 0.9,
		Cosmic: 0.9,
		Fairy: 1.3,
		Metal: 1,
		Flora: 1.08,
		Poison: 1,
		Ice: 0.9,
	};
};

module.exports = CharacterLandmaster;