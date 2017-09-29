/**
 * @author Landmaster
 */

const EntityRegistry = {};

/**
 *
 * @type {Map.<Function, string>}
 */
const ClassToID = new Map();

/**
 * Holds all of the towers.
 * @type {Set.<Function>}
 */
const Towers = new Set();

/**
 *
 * @type {Map.<string, Function>}
 */
const IDToClass = new Map();

/**
 * Register an entity.
 * @param {Function} entityClass
 * @param {string} id
 */
EntityRegistry.register = function (entityClass, id) {
	if (IDToClass.has(id)) {
		throw new RangeError('Entity ID '+id+' is already registered with '+IDToClass[id]);
	}
	ClassToID.set(entityClass, id);
	IDToClass.set(id, entityClass);
	if (entityClass.prototype.isTower) {
		Towers.add(entityClass);
	}
};
EntityRegistry.constructEntity = function (id, world) {
	return new (EntityRegistry.entityClassFromId(id)) (world);
};
EntityRegistry.entityClassFromId = function (id) {
	return IDToClass.get(id);
};
EntityRegistry.entityClassToId = function (entityClass) {
	return ClassToID.get(entityClass);
};
/**
 *
 * @return {Iterator.<Function>}
 */
EntityRegistry.getTowers = function () {
	return Towers.values();
};


EntityRegistry.TOWERS_PER_PLAYER = 4;

module.exports = EntityRegistry;