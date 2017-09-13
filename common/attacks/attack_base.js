const Side = require("common/lib/side");

/**
 * Abstract class for player attacks.
 * @author Landmaster
 */
function AttackBase(attacker) {
	this.attacker = attacker;
}

/**
 * Determine whether an attack is enabled.
 * @return {boolean}
 */
AttackBase.prototype.isAllowed = function () {
	return true;
};
/**
 * Get the cooldown of the special ability, or {@code 0} if the attack is not an ability.
 * @return {number}
 */
AttackBase.prototype.abilityCoolDown = function () {
	return 0;
};
if (Side.getSide() === Side.CLIENT) {
	AttackBase.prototype.render = function () {
	}
} else {
	AttackBase.prototype.updateTick = function (delta) {
	}
}
module.exports = AttackBase;