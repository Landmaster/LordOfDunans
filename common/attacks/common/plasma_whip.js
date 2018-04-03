/**
 * @author Landmaster
 */

const AttackBase = require('common/attacks/attack_base');
const Side = require('common/lib/side');
const GameWorld = require('common/gameplay/game_world');
const AABB = require('common/math/aabb');
const Sphere = require('common/math/sphere');
const Vec3 = require('common/math/vec3');
const Types = require('common/types/types');
const DamageSource = require('common/damage/damage_source');
const AttackRegistry = require('common/attack_registry');

/**
 * Plasma Whip attack
 * @constructor
 */
function PlasmaWhip(attacker) {
	AttackBase.call(this, attacker);
	this.victims = new Set();
}

PlasmaWhip.unlocName = "plasma_whip";

PlasmaWhip.prototype = Object.create(AttackBase.prototype, {
	constructor: {
		value: PlasmaWhip,
		writable: true,
		configurable: true
	}
});

PlasmaWhip.prototype.duration = function () {
	return 10;
};

if (Side.getSide() === Side.CLIENT) {
} else {
	AttackBase.prototype.updateTick = function (delta) {
		let elapsed = this.attacker.world.elapsedTicks - this.startTick;
		if (1 <= elapsed && elapsed <= 9 && this.attacker.world instanceof GameWorld) {
			let opponent = this.attacker.world.getOpponent(this.attacker.index);
			
			if (!this.victims.has(opponent)) {
				let eyeHeight = this.attacker.getEyeHeight();
				
				let secondOffset = new Vec3(eyeHeight * 0.5, eyeHeight, 0).rotate(this.attacker.yaw, 0);
				let hitSpheres = [new Sphere(this.attacker.pos.addTriple(0, eyeHeight, 0), eyeHeight * 0.5),
					new Sphere(this.attacker.pos.add(secondOffset), eyeHeight * 0.5)];
				
				let oppBoxes = opponent.getBoundingBoxes();
				
				if (hitSpheres.some(sph => oppBoxes.some(box => sph.intersectAABB(box)))) {
					opponent.dealDamage(new DamageSource(Types.Normal, 255));
					
					this.victims.add(opponent);
				}
			}
		}
	}
}

module.exports = PlasmaWhip;