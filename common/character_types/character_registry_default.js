/**
 * @author Landmaster
 */
const CharacterRegistry = require('common/character_registry');

const CharacterLandmaster = require('./landmaster');

CharacterRegistry.register(new CharacterLandmaster());

module.exports = CharacterRegistry;