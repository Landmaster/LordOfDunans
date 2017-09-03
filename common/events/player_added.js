/**
 * @author Landmaster
 */

function PlayerAddedEvent(world, player) {
	this.world = world;
	this.player = player;
}
PlayerAddedEvent.NAME = "PLAYER_ADDED";
module.exports = PlayerAddedEvent;