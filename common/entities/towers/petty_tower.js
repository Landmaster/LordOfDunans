const Entity = require('common/entity');
const Side = require("common/lib/side");
const PettyLandlord = require('common/entities/minions/petty_landlord');
const EventBus = require('eventbusjs');
const EntityRemovedEvent = require("common/events/entity_removed");

/**
 * @author Landmaster
 */
function PettyTower(world) {
	Entity.call(this, world);
	
	if (Side.getSide() === Side.SERVER) {
		this.landlords = new Set();
	}
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
} else {
	PettyTower.prototype.updateTick = function (delta) {
		Entity.prototype.updateTick.call(this, delta);
		
		if (this.ticksAlive % 120 === 60 && this.landlords.size < 5) {
			let landlord = new PettyLandlord(this.world);
			landlord.pos = this.pos;
			landlord.spawn(landlord.world);
			this.landlords.add(landlord);
		}
		// TODO add landlord spawn code
	};
	
	EventBus.addEventListener(EntityRemovedEvent.NAME, (ev, data) => {
		this.landlords.delete(data.entity);
	});
}

module.exports = PettyTower;