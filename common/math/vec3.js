/**
 * @author Landmaster
 */

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @constructor
 */
function Vec3(x,y,z) {
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
}

/**
 * @return {Vec3}
 */
Vec3.zero = () => new Vec3(0, 0, 0);
Vec3.prototype.addTriple = function (x, y, z) {
	return !x && !y && !z ? this : new Vec3(this.x+x, this.y+y, this.z+z);
};
Vec3.prototype.add = function (vec) {
	return this.addTriple(vec.x, vec.y, vec.z);
};
Vec3.prototype.subTriple = function (x, y, z) {
	return this.addTriple(-x, -y, -z);
};
Vec3.prototype.sub = function (vec) {
	return this.addTriple(-vec.x, -vec.y, -vec.z);
};
Vec3.prototype.scale = function (scalar) {
	return scalar === 1 ? this : new Vec3(this.x*scalar, this.y*scalar, this.z*scalar);
};
Vec3.prototype.len2 = function () {
	return this.x*this.x + this.y*this.y + this.z*this.z;
};
Vec3.prototype.len = function () {
	return Math.sqrt(this.len2());
};
Vec3.prototype.normalize = function () {
	const len = this.len();
	return len < 1e-4 ? Vec3.zero() : new Vec3(this.x/len, this.y/len, this.z/len);
};
Vec3.prototype.dist2 = function (vec) {
	return this.sub(vec).len2();
};
Vec3.prototype.dist = function (vec) {
	return Math.sqrt(this.dist2(vec));
};
Vec3.prototype.dotProduct = function (vec) {
	return this.x*vec.x+this.y*vec.y+this.z*vec.z;
};
/**
 *
 * @param vec the other vector
 * @param {string} orderString the two components that are considered, such as "xy"
 * @return {number} the 2d cross product
 */
Vec3.prototype.crossProduct2d = function (vec, orderString) {
	return this[orderString[0]] * vec[orderString[1]] - vec[orderString[0]] * this[orderString[1]];
};
Vec3.prototype.crossProduct = function (vec) {
	return new Vec3(this.y*vec.z - this.z*vec.y, this.z*vec.x - this.x*vec.z, this.x*vec.y - this.y*vec.x);
};
Vec3.prototype.project = function (on) {
	if (on.len2() < 1e-8) return Vec3.zero();
	return on.scale(this.dotProduct(on) / on.dotProduct(on));
};
/**
 *
 * @param yaw
 * @param pitch
 * @return {Vec3}
 */
Vec3.prototype.rotate = function (yaw, pitch) {
	let oldYaw = Math.atan2(this.z, this.x);
	let oldPitch = Math.atan2(this.y, Math.sqrt(this.x*this.x + this.z*this.z));
	return new Vec3(
		Math.cos(yaw+oldYaw)*Math.cos(pitch+oldPitch),
		Math.sin(pitch+oldPitch),
		Math.sin(yaw+oldYaw)*Math.cos(pitch+oldPitch))
		.scale(this.len());
};
Vec3.prototype.negate = function () {
	return new Vec3(-this.x,-this.y,-this.z);
};

/**
 *
 * @param {Vec3} a1
 * @param {Vec3} a2
 * @param {Vec3} b1
 * @param {Vec3} b2
 * @param {string} orderString
 * @return {Array.<number>} an array such that a1+array[0]*(a2-a1) = b1+array[1]*(b2-b1)
 */
Vec3.intersectLinesScaleFactor = function (a1, a2, b1, b2, orderString) {
	let af = a2.sub(a1), bf = b2.sub(b1);
	let initDiff = b1.sub(a1);
	let finalCross = af.crossProduct2d(bf, orderString);
	return [initDiff.crossProduct2d(bf, orderString) / finalCross, initDiff.crossProduct2d(af, orderString) / finalCross];
};

/**
 *
 * @param {string} orderString a string, such as "xzy", that determines the position of the old components in the new vector
 * @return {Vec3} the new vector
 */
Vec3.prototype.switchedOrder = function (orderString) {
	let comps = [];
	for (let char of orderString) {
		comps.push(this[char]);
	}
	return new Vec3(...comps);
};

Object.defineProperty(Vec3, 'numComponents', {
	value: 3
});
Vec3.prototype.getComponents = function () { return [this.x, this.y, this.z]; };
Vec3.prototype.getComponent = function (idx) { return this["xyz"[idx]]; };
Vec3.prototype.setComponent = function (idx, val) { this["xyz"[idx]] = val; };

Vec3.prototype.toBabylon = function () {
	const BABYLON = require('babylonjs');
	return new BABYLON.Vector3(this.x, this.y, this.z);
};
/**
 *
 * @param {ByteBuffer} buf
 * @return {Vec3} the vector
 */
Vec3.fromBuf = function (buf) {
	return new Vec3(buf.readDouble(), buf.readDouble(), buf.readDouble());
};
/**
 * @param {Vec3} vec
 * @param {ByteBuffer} buf
 */
Vec3.toBuf = function (vec, buf) {
	buf.writeDouble(vec.x);
	buf.writeDouble(vec.y);
	buf.writeDouble(vec.z);
};
/**
 *
 * @param object the BSON
 * @return {Vec3} the vector
 */
Vec3.fromBSON = function (object) {
	return new Vec3(object.x, object.y, object.z);
};
/**
 *
 * @param {Vec3} vec the vector
 * @return {{x, y, z}} the BSON representation
 */
Vec3.toBSON = function (vec) {
	return {x: vec.x, y: vec.y, z: vec.z};
};

module.exports = Vec3;