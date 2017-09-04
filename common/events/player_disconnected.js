/**
 * Fired when a player disconnects.
 * @param {String} uuid the uuid
 * @constructor
 */
function PlayerDisconnectedEvent(uuid) {
	this.uuid = uuid;
}
PlayerDisconnectedEvent.NAME = "PLAYER_DISCONNECTED";
module.exports = PlayerDisconnectedEvent;