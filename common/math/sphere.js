/**
 * @author Landmaster
 */

const Funs = require('./funs');
const Vec3 = require('./vec3');

/**
 *
 * @param {Vec3} pos
 * @param {number} radius
 * @constructor
 */
function Sphere(pos, radius) {
	this.pos = pos;
	this.radius = radius;
}

/**
 *
 * @param {Vec3} vec
 * @return {Sphere} the sphere shifted by {@code vec}
 */
Sphere.prototype.offset = function (vec) {
	return new Sphere(this.pos.add(vec), this.radius);
};

/**
 *
 * @param {Sphere} other
 * @return {boolean} whether the spheres intersect
 */
Sphere.prototype.intersect = function (other) {
	return this.pos.dist2(other.pos) <= (this.radius*other.radius) * (this.radius*other.radius);
};

/**
 *
 * @param {Vec3} vec
 * @return {boolean} whether the sphere has the point
 */
Sphere.prototype.intersectPoint = function (vec) {
	return this.pos.dist2(vec) <= this.radius*this.radius;
};

/**
 *
 * @param {AABB} aabb
 * @return {boolean} whether the sphere and AABB intersect
 */
Sphere.prototype.intersectAABB = function (aabb) {
	let closestPoint = new Vec3(
		...(['x','y','z'].map((char) => Funs.clamp(this.pos[char], aabb.vec1[char], aabb.vec2[char])))
	);
	return this.intersectPoint(closestPoint);
};

module.exports = Sphere;