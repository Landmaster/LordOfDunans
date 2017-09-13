const CharacterTypeBase = require('./character_type_base');
const Side = require('common/lib/side');

/**
 * Yours truly.
 * @author Landmaster
 * @constructor
 */
function CharacterLandmaster() {
	CharacterTypeBase.call(this);
}
CharacterLandmaster.prototype = Object.create(CharacterTypeBase.prototype, {
	constructor: {
		value: CharacterLandmaster,
		writable: true,
		configurable: true
	}
});

if (Side.getSide() === Side.CLIENT) {
	CharacterTypeBase.prototype.avatarImage = function () {
		return "/assets/images/character_avatars/landmaster.png"; // defaults to Landmaster's
	}
}

module.exports = CharacterLandmaster;