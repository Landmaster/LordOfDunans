/**
 * @author Landmaster
 */

const Vec3 = require('./vec3');

/**
 *
 * @param {Vec3} vec1
 * @param {Vec3} vec2
 * @constructor
 */
function AABB(vec1, vec2) {
	let vec1Comps = vec1.getComponents();
	let vec2Comps = vec2.getComponents();
	
	for (let i=0; i<Vec3.numComponents; ++i) {
		if (vec1Comps[i] > vec2Comps[i]) {
			[vec1Comps[i], vec2Comps[i]] = [vec2Comps[i], vec1Comps[i]];
		}
	}
	
	this.vec1 = new Vec3(...vec1Comps);
	this.vec2 = new Vec3(...vec2Comps);
}

/**
 *
 * @param {AABB} other
 * @returns {boolean} whether the boxes intersect
 */
AABB.prototype.intersects = function (other) {
	return this.vec1.getComponents().every((val, idx) => val <= other.vec2.getComponent(idx))
		&& other.vec1.getComponents().every((val, idx) => val <= this.vec2.getComponent(idx));
};

/**
 *
 * @param {Vec3} vec
 * @returns {AABB}
 */
AABB.prototype.addVec = function (vec) {
	return new AABB(this.vec1.add(vec), this.vec2.add(vec));
};

module.exports = AABB;