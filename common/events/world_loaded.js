/**
 * @author Landmaster
 */

function WorldLoadedEvent(world) {
	this.world = world;
}
WorldLoadedEvent.NAME = "WORLD_LOADED";
module.exports = WorldLoadedEvent;