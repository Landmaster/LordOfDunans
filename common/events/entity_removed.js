/**
 * @author Landmaster
 */

function EntityRemovedEvent(world, entity) {
	this.world = world;
	this.entity = entity;
}
EntityRemovedEvent.NAME = "ENTITY_REMOVED";
module.exports = EntityRemovedEvent;