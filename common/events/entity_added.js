/**
 * @author Landmaster
 */

function EntityAddedEvent(world, entity) {
	this.world = world;
	this.entity = entity;
}
EntityAddedEvent.NAME = "ENTITY_ADDED";
module.exports = EntityAddedEvent;