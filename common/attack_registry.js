/**
 * @author Landmaster
 */

/**
 *
 * @type {Map<string, Function>}
 * @private
 */
const _attackMap = new Map();

// TODO add registry
const AttackRegistry = {};

/**
 *
 * @param {Function} attack
 */
AttackRegistry.register = function (attack) {
	_attackMap.set(attack.unlocName, attack);
};
/**
 *
 * @param {string} name
 * @return {Function} the attack constructor
 */
AttackRegistry.getAttack = function (name) {
	return _attackMap.get(name);
};

module.exports = AttackRegistry;