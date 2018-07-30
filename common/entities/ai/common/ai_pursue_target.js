/**
 * @author Landmaster
 */

const AIBase = require('common/entities/ai/ai_base');
const Side = require('common/lib/side');

/**
 *
 * @param {Entity} entity
 * @param {number} range
 * @param {number} velMagnitude
 * @constructor
 */
function AIPursueTarget(entity, range, velMagnitude) {
	AIBase.call(this, entity);
	this.range = range;
	this.velMagnitude = velMagnitude;
}

AIPursueTarget.prototype = Object.create(AIBase.prototype, {
	constructor: {
		value: AIPursueTarget,
		writable: true,
		configurable: true
	}
});

AIPursueTarget.prototype.canRun = function () {
	return this.entity.aiManager.aiTarget && this.entity.aiManager.aiTarget.pos.dist2(this.entity.pos) <= this.range*this.range;
};

AIPursueTarget.prototype.shouldContinue = function () {
	return this.canRun();
};

if (Side.getSide() === Side.SERVER) {
	AIPursueTarget.prototype.updateTick = function (delta) {
		let directionToGo = this.entity.aiManager.aiTarget.pos.sub(this.entity.pos).normalize();
		this.entity.velocity = directionToGo.scale(this.velMagnitude);
		//console.log(this.entity.pos);
		// TODO refine code
	};
}

module.exports = AIPursueTarget;
