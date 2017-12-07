/**
 * @author Landmaster
 */

const Ops = {};

Ops.clamp = function (x, a, b) {
	return Math.max(a, Math.min(x,b));
};

module.exports = Ops;