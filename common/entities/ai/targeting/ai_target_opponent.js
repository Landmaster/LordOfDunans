/**
 * @author Landmaster
 */

const AIBase = require('common/entities/ai/ai_base');
const Side = require('common/lib/side');

function AITargetOpponent(entity) {
	AIBase.call(this, entity);
}

AITargetOpponent.prototype.canRun = function () {
	return true;
};

AITargetOpponent.prototype.shouldContinue = function () {
	return this.canRun();
};

if (Side.getSide() === Side.SERVER) {
	AITargetOpponent.prototype.updateTick = function (delta) {
		// TODO add code for getting opponent
	};
}

AITargetOpponent.prototype = Object.create(AIBase.prototype, {
	constructor: {
		value: AITargetOpponent,
		writable: true,
		configurable: true
	}
});

module.exports = AITargetOpponent;
