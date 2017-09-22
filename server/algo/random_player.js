const Promise = require('bluebird');
const defer = require('common/lib/deferred');
const PreparationWorld = require('common/menu/prep_world');
const EmptyWorld = require('common/menu/empty_world');
const Vec3 = require('common/math/vec3');

/**
 * Search for a random opponent.
 * @param server the Dunans server
 * @param player the player
 * @param timeout the timeout window in milliseconds
 * @returns {Promise} a promise holding the players
 */
function findRandomOpponent(server, player, timeout) {
	for (let [pendingPlayer, pendingDfd] of server.pendingPlayers) {
		if (player !== pendingPlayer) { // found a waiting player
			let arr = [player, pendingPlayer];
			player.despawn();
			player.spawn(pendingPlayer.world);
			player.setPositionAndUpdate(new Vec3(0, 0, -7));
			
			server.pendingPlayers.delete(pendingPlayer);
			server.pairedPlayers.addPair(...arr);
			pendingDfd.resolve(arr);
			return Promise.resolve(arr);
		}
	}
	const df = new defer();
	server.pendingPlayers.set(player, df);
	player.despawn();
	player.spawn(new PreparationWorld(server));
	player.setPositionAndUpdate(new Vec3(0, 0, 7));
	
	return df.promise.timeout(timeout).catch(Promise.TimeoutError, e => {
		server.pendingPlayers.delete(player);
		player.despawn();
		player.spawn(new EmptyWorld(server));
		throw e; // propagate the timeout
	});
}

module.exports = findRandomOpponent;