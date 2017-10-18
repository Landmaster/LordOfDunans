/**
 * @author Landmaster
 */

function WorldUnloadedEvent(world) {
	this.world = world;
}
WorldUnloadedEvent.NAME = "WORLD_UNLOADED";
module.exports = WorldUnloadedEvent;