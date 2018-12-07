/**
 * @author Landmaster
 */

const AIBase = require('common/entities/ai/ai_base');
const Side = require('common/lib/side');

/**
 *
 * @param entity
 * @constructor
 */
function AITargetOpponent(entity) {
	AIBase.call(this, entity);
}

AITargetOpponent.prototype = Object.create(AIBase.prototype, {
	constructor: {
		value: AITargetOpponent,
		writable: true,
		configurable: true
	}
});

AITargetOpponent.prototype.canRun = function () {
	return true;
};

AITargetOpponent.prototype.shouldContinue = function () {
	return this.canRun();
};

if (Side.getSide() === Side.SERVER) {
	AITargetOpponent.prototype.updateTick = function (delta) {
		//console.log(this.entity.aiManager.aiTarget);
		if (!this.entity.aiManager.aiTarget) {
			this.entity.aiManager.aiTarget = this.entity.world.getOpponent(this.entity.side);
		}
	};
}

module.exports = AITargetOpponent;
