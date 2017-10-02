/**
 * @author Landmaster
 */

const EntityRegistry = require('common/entity_registry');

const PettyTower = require('./towers/petty_tower');
const TowerOfIgnorance = require('./towers/tower_of_ignorance');
const CovertTower = require('./towers/covert_tower');
const TowerOfActivists = require('./towers/tower_of_activists');

EntityRegistry.register(PettyTower, 'petty_tower');
EntityRegistry.register(TowerOfIgnorance, 'tower_of_ignorance');
EntityRegistry.register(CovertTower, 'covert_tower');
EntityRegistry.register(TowerOfActivists, 'tower_of_activists');

module.exports = EntityRegistry;