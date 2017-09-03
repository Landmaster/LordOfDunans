/**
 * @author Landmaster
 */

function PlayerRemovedEvent(world, player) {
	this.world = world;
	this.player = player;
}
PlayerRemovedEvent.NAME = "PLAYER_REMOVED";
module.exports = PlayerRemovedEvent;