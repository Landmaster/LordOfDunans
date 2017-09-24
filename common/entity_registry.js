/**
 * @author Landmaster
 */

const EntityRegistry = {};

EntityRegistry.MAX_ID = 0xFFFF;

/**
 *
 * @type {Map.<Function, number>}
 */
const ClassToID = new Map();

/**
 * Holds all of the towers.
 * @type {Set.<Function>}
 */
const Towers = new Set();

/**
 *
 * @type {Array.<Function>}
 */
const IDToClass = new Array(EntityRegistry.MAX_ID);

EntityRegistry.register = function (entityClass, id) {
	if ((id & EntityRegistry.MAX_ID) !== id) {
		throw new RangeError('Entity ID should be between 0 and '
			+EntityRegistry.MAX_ID+' inclusive; got '+id+'instead');
	} else if (IDToClass[id]) {
		throw new RangeError('Entity ID '+id+' is already registered with '+IDToClass[id]);
	}
	ClassToID.set(entityClass, id);
	IDToClass[id] = entityClass;
	if (entityClass.prototype.isTower) {
		Towers.add(entityClass);
	}
};
EntityRegistry.constructEntity = function (id, world) {
	return new (EntityRegistry.entityClassFromId(id)) (world);
};
EntityRegistry.entityClassFromId = function (id) {
	if ((id & EntityRegistry.MAX_ID) !== id) {
		throw new RangeError('Entity ID should be between 0 and '
			+EntityRegistry.MAX_ID+' inclusive; got '+id+'instead');
	}
	return IDToClass[id];
};
EntityRegistry.entityToID = function (entity) {
	const id = ClassToID.get(entity.constructor);
	if (typeof id === 'undefined') {
		throw new TypeError('The entity class '+entity.constructor+' for entity '+entity+' is not registered');
	}
	return id;
};
/**
 *
 * @return {Iterator.<Function>}
 */
EntityRegistry.getTowers = function () {
	return Towers.values();
};

module.exports = EntityRegistry;