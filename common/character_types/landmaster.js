const CharacterTypeBase = require('./character_type_base');
//const Side = require('common/lib/side');

/**
 * Yours truly.
 * @author Landmaster
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

module.exports = CharacterLandmaster;