/**
 * @author Landmaster
 */

/**
 *
 * @param {Vec3} normal
 * @param {Vec3} point
 * @constructor
 */
function Plane(normal, point) {
	this.normal = normal;
	this.point = point;
}

/**
 *
 * @param {Vec3} vec1
 * @param {Vec3} vec2
 * @param {Vec3} vec3
 * @return {Plane}
 */
Plane.fromThreeVectors = function (vec1, vec2, vec3) {
	let normal = (vec2.sub(vec1)).crossProduct(vec3.sub(vec1));
	return new Plane(normal, vec1);
};

/**
 *
 * @param {Vec3} vec1 the start of the line
 * @param {Vec3} vec2 the end of the line
 * @return {number} the number such that vec1*(1-scaleFactor)+vec2*scaleFactor is the intersection of the line and plane
 */
Plane.prototype.intersectLineScaleFactor = function (vec1, vec2) {
	return this.normal.dotProduct(this.point.sub(vec1)) / this.normal.dotProduct(vec2.sub(vec1));
};

/**
 *
 * @param {Vec3} vec1 the start of the line
 * @param {Vec3} vec2 the end of the line
 * @param {boolean} [isSegment] whether to check for segment bounds
 * @return {?Vec3} return a Vec3 if there is an intersection, and undefined otherwise
 */
Plane.prototype.intersectLine = function (vec1, vec2, isSegment) {
	let scaleFactor = this.intersectLineScaleFactor(vec1, vec2);
	if (isSegment && (scaleFactor < 0 || scaleFactor > 1)) {
		return undefined;
	}
	return vec1.add((vec2.sub(vec1)).scale(scaleFactor));
};

module.exports = Plane;