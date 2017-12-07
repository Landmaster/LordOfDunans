const CharacterTypeBase = require("./character_types/character_type_base");

/**
 *
 * @type {Map.<string, CharacterTypeBase>}
 * @private
 */
const _characterMap = new Map();

/**
 * @author Landmaster
 */
const CharacterRegistry = {};

CharacterRegistry.register = function (ctb) {
	_characterMap.set(ctb.identifier, ctb);
};
CharacterRegistry.getCharacterType = function (identifier) {
	return _characterMap.get(identifier) || CharacterTypeBase.EMPTY;
};
CharacterRegistry.getCharacterIdentifier = function (ctb) {
	return ctb.identifier;
};
/**
 *
 * @return {Iterator.<Array>}
 */
CharacterRegistry.getEntries = function () {
	return _characterMap.entries();
};

module.exports = CharacterRegistry;