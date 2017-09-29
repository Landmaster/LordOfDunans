const Entity = require('common/entity');
const Side = require("common/lib/side");

/**
 * @author Landmaster
 */
function PettyTower(world) {
	Entity.call(this, world);
}

PettyTower.prototype = Object.create(Entity.prototype, {
	constructor: {
		value: PettyTower,
		writable: true,
		configurable: true
	}
});

Object.defineProperty(PettyTower.prototype, 'isTower', {
	value: true
});

if (Side.getSide() === Side.CLIENT) {
	Object.defineProperty(PettyTower.prototype, 'towerIcon', {
		value: "/assets/images/towers/petty_tower.png"
	});
}

module.exports = PettyTower;