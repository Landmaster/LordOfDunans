/**
 *
 * @type {Map.<String, CharacterTypeBase>}
 * @private
 */
const _characterMap = new Map();

/**
 * @author Landmaster
 */
const CharacterRegistry = {};

CharacterRegistry.register = function (key, ctb) {
	_characterMap.set(key, ctb);
};
CharacterRegistry.getCharacterType = function (key) {
	return _characterMap.get(key);
};
CharacterRegistry.getEntries = function () {
	return _characterMap.entries();
};

module.exports = CharacterRegistry;