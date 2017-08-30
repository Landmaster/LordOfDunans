const Side = {};

Side.CLIENT = 1;
Side.SERVER = 2;

/**
 * Get the side of the script.
 * @returns {number} the side of the currently running script ({@code Side.SERVER} or {@code Side.CLIENT})
 */
Side.getSide = function getSide() {
	return typeof window === 'undefined' ? Side.SERVER : Side.CLIENT;
};

module.exports = Side;