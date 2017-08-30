/**
 * @author Landmaster
 */

const Loading = require('./loading');

/**
 * Define a union of HTML elements.
 * @param {Function} cb the callback to determine the right variant to load.
 * @param {Array.<Element|Array>} elements an array containing {@link Element}s and/or {@link Array}s containing
 * the {@link Element}, load callback, and unload callback (in that order).
 * @constructor
 */
function ElementVariant(cb, ...elements) {
	this.elements = elements;
	this.cb = cb || (ev => ev.currentVariantIdx);
	this.currentVariantIdx = cb(this);
}

/**
 * Update this {@link ElementVariant}.
 */
ElementVariant.prototype.update = function () {
	this.loadIdx(this.cb(this));
};

/**
 * Load the variant at the specified index (INTERNAL).
 * @param idx
 */
ElementVariant.prototype.loadIdx = function (idx) {
	Loading.unload(this.elements[this.currentVariantIdx]);
	Loading.load(this.elements[ (this.currentVariantIdx=idx) ]);
};

ElementVariant.prototype.load = function () {
	Loading.load(this.elements[this.currentVariantIdx]);
};

ElementVariant.prototype.unload = function () {
	Loading.unload(this.elements[this.currentVariantIdx]);
};

module.exports = ElementVariant;