/**
 * @author Landmaster
 */

/**
 *
 * @param {string} type
 * @param {number} amount
 * @constructor
 */
function DamageSource(type, amount) {
	this.type = type;
	this.amount = amount;
}

module.exports = DamageSource;