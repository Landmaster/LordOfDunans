/**
 * @author Landmaster
 */

const Funs = {};

Funs.clamp = function (x, a, b) {
	return Math.max(a, Math.min(x,b));
};

module.exports = Funs;