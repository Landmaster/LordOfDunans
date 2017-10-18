/**
 * @author Landmaster
 */

const World = require('common/world');

/**
 *
 * @param mainInstance
 * @constructor
 */
function GameWorld(mainInstance) {
	World.call(this, mainInstance);
}

GameWorld.prototype = Object.create(World.prototype, {
	constructor: {
		value: GameWorld,
		writable: true,
		configurable: true
	}
});

module.exports = GameWorld;