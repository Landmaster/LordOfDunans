const Entity = require('common/entity');
const Side = require("common/lib/side");

/**
 * @author Landmaster
 */
function TowerOfActivists(world) {
	Entity.call(this, world);
}

TowerOfActivists.prototype = Object.create(Entity.prototype, {
	constructor: {
		value: TowerOfActivists,
		writable: true,
		configurable: true
	}
});

Object.defineProperty(TowerOfActivists.prototype, 'isTower', {
	value: true
});

if (Side.getSide() === Side.CLIENT) {
	Object.defineProperty(TowerOfActivists.prototype, 'towerIcon', {
		value: "/assets/images/towers/tower_of_activists.png"
	});
}

module.exports = TowerOfActivists;