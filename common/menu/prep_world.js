/**
 * @author Landmaster
 */

const World = require('common/world');

function PreparationWorld(mainInstance) {
	World.call(this, mainInstance);
	if (Side.getSide() === Side.CLIENT) {
		
	}
}

PreparationWorld.prototype = Object.create(World.prototype, {
	constructor: {
		value: PreparationWorld,
		writable: true,
		configurable: true
	}
});

module.exports = PreparationWorld;