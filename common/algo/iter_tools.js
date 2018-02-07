/**
 * @author Landmaster
 */

const IterTools = {};

/**
 *
 * @param iterable
 * @param {function(T):boolean} predicate
 * @return {boolean} Whether all elements of the iterable satisfy {@code predicate}. Returns {@code true} for an empty iterable.
 * @template T
 */
IterTools.every = function (iterable, predicate) {
	for (let val of iterable) {
		if (!predicate(val)) { return false; }
	}
	return true;
};

/**
 *
 * @param iterables
 */
IterTools.cartesianProduct = function* (...iterables) {
	iterables.reverse(); // used so that params appear in order
	yield* cartesianProductImpl(iterables, []);
};

/**
 *
 * @param {Array} iterables
 * @param {Array} prefix
 */
function *cartesianProductImpl(iterables, prefix) {
	if (!iterables.length) {
		yield prefix;
	} else {
		let iterable = iterables.pop();
		for (let val of iterable) {
			prefix.push(val);
			yield* cartesianProductImpl(iterables, prefix);
			prefix.pop();
		}
		iterables.push(iterable);
	}
}

module.exports = IterTools;