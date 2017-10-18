/**
 * Fired when a player disconnects.
 * @constructor
 */
function PlayerDisconnectedEvent(player) {
	this.player = player;
}
PlayerDisconnectedEvent.NAME = "PLAYER_DISCONNECTED";
module.exports = PlayerDisconnectedEvent;