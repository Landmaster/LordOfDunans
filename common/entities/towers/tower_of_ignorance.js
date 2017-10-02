/**
 * @author Landmaster
 */

const Entity = require('common/entity');
const Side = require("common/lib/side");

function TowerOfIgnorance(world) {
	Entity.call(this, world);
}

TowerOfIgnorance.prototype = Object.create(Entity.prototype, {
	constructor: {
		value: TowerOfIgnorance,
		writable: true,
		configurable: true
	}
});

Object.defineProperty(TowerOfIgnorance.prototype, "isTower", {
	value: true
});

if (Side.getSide() === Side.CLIENT) {
	Object.defineProperty(TowerOfIgnorance.prototype, 'towerIcon', {
		value: "/assets/images/towers/tower_of_ignorance.png"
	});
}

module.exports = TowerOfIgnorance;