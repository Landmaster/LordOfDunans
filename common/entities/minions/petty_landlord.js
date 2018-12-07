/**
 * @author Landmaster
 */

const Entity = require('common/entity');
const Side = require("common/lib/side");
const AIPursueTarget = require('common/entities/ai/common/ai_pursue_target');
const AITargetOpponent = require('common/entities/ai/targeting/ai_target_opponent');

function PettyLandlord(world) {
	Entity.call(this, world);
	if (Side.getSide() === Side.SERVER) {
		this.aiManager.aiList = [new AIPursueTarget(this, 1000, 5)]; // TODO reduce range
		this.aiManager.targetAiList = [new AITargetOpponent(this)];
	}
}

PettyLandlord.prototype = Object.create(Entity.prototype, {
	constructor: {
		value: PettyLandlord,
		writable: true,
		configurable: true
	}
});

if (Side.getSide() === Side.CLIENT) {
} else {
	PettyLandlord.prototype.updateTick = function (delta) {
		Entity.prototype.updateTick.call(this, delta);
	};
}

module.exports = PettyLandlord;
