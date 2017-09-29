/**
 * @author Landmaster
 */

const EntityRegistry = require('common/entity_registry');

const PettyTower = require('./towers/petty_tower');

EntityRegistry.register(PettyTower, 'petty_tower');

module.exports = EntityRegistry;