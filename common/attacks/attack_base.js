/**
 * @author Landmaster
 */

const Side = require("common/lib/side");

/**
 * Abstract class for player attacks.
 * @param {Player} attacker
 * @constructor
 */
function AttackBase(attacker) {
	this.attacker = attacker;
	this.startTick = attacker.world.elapsedTicks;
}

/**
 * 
 * @type {string}
 */
AttackBase.unlocName = "";

/**
 * Duration, in ticks.
 * @return {number}
 */
AttackBase.prototype.duration = function () {
	return 10;
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
	/**
	 * Called every tick it is active.
	 * @param delta
	 */
	AttackBase.prototype.updateTick = function (delta) {
	}
}
module.exports = AttackBase;