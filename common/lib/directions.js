const Vec3 = require('common/math/vec3');

/**
 * @author Landmaster
 */
const _Directions = {
	FORWARD: 0,
	RIGHT: 1,
	BACKWARD: 2,
	LEFT: 3,
};
const Directions = Object.assign({}, _Directions);
Directions.getDirections = function* () {
	for (let dirName in _Directions) {
		yield _Directions[dirName];
	}
};
Directions.getKeyForDirection = function (dir) {
	switch (dir) {
		case Directions.FORWARD:
			return 'w';
		case Directions.RIGHT:
			return 'd';
		case Directions.BACKWARD:
			return 's';
		case Directions.LEFT:
			return 'a';
	}
};
Directions.getUnitVector = function (dir) {
	switch (dir) {
		case Directions.FORWARD:
			return new Vec3(0,0,1);
		case Directions.RIGHT:
			return new Vec3(1,0,0);
		case Directions.BACKWARD:
			return new Vec3(0,0,-1);
		case Directions.LEFT:
			return new Vec3(-1,0,0);
	}
};
module.exports = Directions;