const Promise = require('bluebird');
const EventBus = require('eventbusjs');
const defer = require('common/lib/deferred');
const PreparationWorld = require('common/menu/prep_world');
const EmptyWorld = require('common/menu/empty_world');
const Vec3 = require('common/math/vec3');

const PlayerDisconnectedEvent = require('common/events/player_disconnected');

/**
 * Holds the players waiting for opponents, mapping them to a deferred object.
 * @type {Map.<Player, defer>}
 */
const pendingPlayers = new Map();

/**
 * Search for a random opponent.
 * @param server the Dunans server
 * @param player the player
 * @param timeout the timeout window in milliseconds
 * @returns {Promise} a promise holding the players
 */
function findRandomOpponent(server, player, timeout) {
	if (pendingPlayers.has(player)) return Promise.reject(new Promise.TimeoutError("Should not happen!"));
	
	for (let [pendingPlayer, pendingDfd] of pendingPlayers) {
		if (player !== pendingPlayer) { // found a waiting player
			let arr = [player, pendingPlayer];
			player.despawn();
			player.spawn(pendingPlayer.world);
			player.setPositionAndUpdate(new Vec3(0, 0, -7));
			
			pendingPlayers.delete(pendingPlayer);
			server.pairedPlayers.addPair(...arr);
			pendingDfd.resolve(arr);
			return Promise.resolve(arr);
		}
	}
	const df = new defer();
	pendingPlayers.set(player, df);
	player.despawn();
	player.spawn(new PreparationWorld(server).load());
	player.setPositionAndUpdate(new Vec3(0, 0, 7));
	
	return df.promise.timeout(timeout).catch(Promise.TimeoutError, e => {
		pendingPlayers.delete(player);
		player.despawn();
		player.spawn(new EmptyWorld(server).load());
		throw e; // propagate the timeout
	});
}

EventBus.addEventListener(PlayerDisconnectedEvent.NAME, (ev, data) => {
	pendingPlayers.delete(data.player);
});

module.exports = findRandomOpponent;