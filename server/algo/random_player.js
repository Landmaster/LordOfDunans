const Promise = require('bluebird');
const defer = require('common/lib/deferred')

/**
 * Search for a random opponent.
 * @param server the Dunans server
 * @param player the player
 * @param timeout the timeout window in milliseconds
 * @returns a promise holding the players
 */
function findRandomOpponent(server, player, timeout) {
	for (let [pendingPlayer, pendingDfd] of server.pendingPlayers) {
		if (player !== pendingPlayer) { // found a waiting player
			let arr = [player, pendingPlayer];
			pendingDfd.resolve(arr);
			server.pendingPlayers.delete(pendingPlayer);
			return Promise.resolve(arr);
		}
	}
	const df = defer();
	server.pendingPlayers.set(player, df);
	
	return df.promise.timeout(timeout).catch(Promise.TimeoutError, e => {
		server.pendingPlayers.delete(player);
		throw e; // propagate the timeout
	});
}

module.exports = findRandomOpponent;