/**
 * @author Landmaster
 */

const EntityRegistry = require('common/entity_registry');

const PettyTower = require('./towers/petty_tower');
const TowerOfIgnorance = require('./towers/tower_of_ignorance');

EntityRegistry.register(PettyTower, 'petty_tower');
EntityRegistry.register(TowerOfIgnorance, 'tower_of_ignorance');

module.exports = EntityRegistry;