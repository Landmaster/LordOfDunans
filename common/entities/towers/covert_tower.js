const Entity = require('common/entity');
const Side = require("common/lib/side");

/**
 * @author Landmaster
 */
function CovertTower(world) {
	Entity.call(this, world);
}

CovertTower.prototype = Object.create(Entity.prototype, {
	constructor: {
		value: CovertTower,
		writable: true,
		configurable: true
	}
});

Object.defineProperty(CovertTower.prototype, 'isTower', {
	value: true
});

if (Side.getSide() === Side.CLIENT) {
	Object.defineProperty(CovertTower.prototype, 'towerIcon', {
		value: "/assets/images/towers/covert_tower.png"
	});
}

module.exports = CovertTower;