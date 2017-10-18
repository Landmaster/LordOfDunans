/**
 * @author Landmaster
 */

const Promise = require('bluebird');
const defer = require('common/lib/deferred');
const PreparationWorld = require('common/menu/prep_world');
const EventBus = require('eventbusjs');

const PlayerDisconnectedEvent = require('common/events/player_disconnected');
const WorldUnloadedEvent = require("common/events/world_unloaded");
const UuidUtils = require("common/lib/uuid_utils");
const PacketHandler = require("common/lib/packethandler");
const Packet = require("common/lib/packets/game_init_packets");

/**
 * Holds the players waiting for their opponents to start.
 * @type {Map.<Player, defer>}
 */
const waitingPlayers = new Map();

/**
 *
 * @param server
 * @param requestingPlayer
 * @return {Promise}
 */
function waitForOpponent(server, requestingPlayer) {
	if (!requestingPlayer.world instanceof PreparationWorld || requestingPlayer.world.isPlayerLocked(
		UuidUtils.bytesToUuid(requestingPlayer.uuid))) {
		return Promise.reject(new Promise.TimeoutError("Should not happen!"));
	}
	
	requestingPlayer.world.lockPlayer(UuidUtils.bytesToUuid(requestingPlayer.uuid));
	let players = server.pairedPlayers.getPair(requestingPlayer);
	
	for (let player of players) {
		if (player !== requestingPlayer) {
			let dfd;
			if (waitingPlayers.has(player)) {
				dfd = waitingPlayers.get(player);
				if (player.world instanceof PreparationWorld) {
					player.world.doStart();
				}
				dfd.resolve(null);
				return Promise.resolve(null);
			} else {
				dfd = new defer();
				waitingPlayers.set(requestingPlayer, dfd);
				
				PacketHandler.sendToEndpoint(new Packet.startGamePacket(), requestingPlayer.ws);
				
				return dfd.promise;
			}
		}
	}
}

EventBus.addEventListener(PlayerDisconnectedEvent.NAME, (ev, data) => {
	waitingPlayers.delete(data.player);
});
EventBus.addEventListener(WorldUnloadedEvent.NAME, (ev, data) => {
	if (data.world instanceof PreparationWorld) {
		data.world.players.forEach(player => void(waitingPlayers.delete(player)));
	}
});

module.exports = waitForOpponent;