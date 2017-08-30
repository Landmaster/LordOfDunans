/**
 * @author Landmaster
 */
function Vec3(x,y,z) {
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
}
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
Vec3.prototype.toBabylon = function () {
	const BABYLON = require('babylonjs');
	return new BABYLON.Vector3(this.x, this.y, this.z);
};
/**
 *
 * @param {ByteBuffer} buf
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
module.exports = Vec3;