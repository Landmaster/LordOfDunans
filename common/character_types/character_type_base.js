const Side = require('common/lib/side');

/**
 * @author Landmaster
 * @constructor
 */
function CharacterTypeBase() {
	/**
	 * List of possible attacks
	 * @type {Map.<String, Function>}
	 */
	this.attacks = new Map();
}

if (Side.getSide() === Side.CLIENT) {
	CharacterTypeBase.prototype.avatarImage = function () {
		return "/assets/images/character_avatars/landmaster.png"; // defaults to Landmaster's
	}
}

module.exports = CharacterTypeBase;