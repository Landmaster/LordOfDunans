/**
 * @author Landmaster
 */

const AttackRegistry = require('common/attack_registry');

const PlasmaWhip = require('common/attacks/common/plasma_whip');

AttackRegistry.register(PlasmaWhip);

module.exports = AttackRegistry;
