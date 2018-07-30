/**
 * @author Landmaster
 */

const Side = require('common/lib/side');

/**
 *
 * @param {Entity} entity
 * @constructor
 */
function AIBase(entity) {
	this.entity = entity;
}

AIBase.prototype.canRun = function () {
	return true;
};

AIBase.prototype.shouldContinue = function () {
	return true;
};

if (Side.getSide() === Side.SERVER) {
	AIBase.prototype.updateTick = function (delta) {
	};
}

module.exports = AIBase;
