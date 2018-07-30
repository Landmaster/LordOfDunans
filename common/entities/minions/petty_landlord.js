/**
 * @author Landmaster
 */

const Entity = require('common/entity');
const Side = require("common/lib/side");
const AIPursueTarget = require('common/entities/ai/common/ai_pursue_target');

function PettyLandlord(world) {
	Entity.call(this, world);
	this.aiManager.aiList = [new AIPursueTarget(this, 1000, 5)]; // TODO reduce range
	this.aiManager.targetAiList = []; // TODO add AITargetOpponent when finished
	
	this.aiManager.aiTarget = world.getPlayerByIndex(0); // TODO remove when we have a proper implementation of AITargetOpponent
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
