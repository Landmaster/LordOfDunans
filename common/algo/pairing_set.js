/**
 * A set that holds pairs such that one can access a pair from one of its members. Order
 * of insertion is preserved.
 * @author Landmaster
 * @constructor
 * @template T
 */
function PairingSet() {
	/**
	 * The backing map.
	 * @type {Map.<T, Array.<T>>}
	 * @private
	 */
	this._map = new Map();
	Object.defineProperty(this, 'size', {
		get: () => this._map.size / 2
	});
}

function __keyEquals(val, val1) {
	return val === val1 || (Number.isNaN(val) && Number.isNaN(val1));
}

/**
 * The iterator yields the pairs in order of insertion.
 */
PairingSet.prototype[Symbol.iterator] = function *() {
	let isSecond = false;
	for (let v of this._map.values()) {
		if (isSecond) {
			yield v.slice(); // Yields the array every 2nd time for consistent behavior when removing a pair from this map.
		}
		isSecond = !isSecond;
	}
};
/**
 * Clear the pair set.
 */
PairingSet.prototype.clear = function () {
	this._map.clear();
};
/**
 * Deletes the pair that has the given member.
 * @param val the member to delete
 * @return {boolean} whether the deletion was successful
 */
PairingSet.prototype.deleteElem = function (val) {
	if (this._map.has(val)) {
		const pair = this._map.get(val);
		this._map.delete(pair[0]);
		this._map.delete(pair[1]);
		return true;
	}
	return false;
};
/**
 * Deletes the given pair.
 * @param val the first element
 * @param val1 the second element
 * @return {boolean} whether the deletion was successful
 */
PairingSet.prototype.deletePair = function (val, val1) {
	if (this._map.has(val) && this._map.has(val1)
		&& this._map.get(val) === this._map.get(val1)) {
		this._map.delete(val);
		this._map.delete(val1);
		return true;
	}
	return false;
};
/**
 * Invoke a callback for every pair in this PairingSet. The callback is called
 * with the pair as the 1st and 2nd arguments, and the collection itself as the 3rd.
 * @param callback the callback function
 * @param thisArg to be set as the {@code this} value in the callback
 */
PairingSet.prototype.forEach = function (callback, thisArg) {
	for (let entry of this) {
		callback.call(thisArg, entry, entry, this);
	}
};
/**
 * Adds a pair to the set. The elements of the pair have to be different from each
 * other any any other pair members in the set.
 * @param val the first value
 * @param val1 the second value
 */
PairingSet.prototype.addPair = function (val, val1) {
	if (__keyEquals(val, val1)) { // equal keys
		throw new RangeError(val+' and '+val1+' should be distinct, but are not');
	}
	if (!this._map.has(val) && !this._map.has(val1)) {
		let pair = [val, val1];
		this._map.set(val, pair);
		this._map.set(val1, pair);
	} else {
		throw new RangeError('At least one of '+val+' and '+val1+' is already in the set');
	}
};

/**
 * Checks whether a value is an element of a pair in the set.
 * @param val the value
 * @return {boolean} whether the given value is an element of a pair in the set.
 */
PairingSet.prototype.hasElem = function (val) {
	return this._map.has(val);
};

/**
 * Check whether the pair is in the set.
 * @param val the first value
 * @param val1 the second value
 * @return {boolean} whether the pair is in the set
 */
PairingSet.prototype.hasPair = function (val, val1) {
	return this._map.has(val) && this._map.has(val1)
		&& this._map.get(val) === this._map.get(val1);
};

/**
 * Gets the pair in the set with the specified value.
 * @param val the value
 * @return {?Array.<T>} the pair, or {@code undefined} if the pair is nonexistent
 */
PairingSet.prototype.getPair = function (val) {
	if (this._map.has(val)) {
		return this._map.get(val).slice(); // to prevent modification
	}
	return undefined;
};

module.exports = PairingSet;