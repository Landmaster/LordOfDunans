/**
 * This module includes the {@link PacketHandler} module, and registers the standard packets for this game.
 * @author Landmaster
 */

// TODO make sure to add handler files here

module.exports = require('./lib/packethandler');

require('./handlers/accounts');
require('./handlers/entity_spawn');
require('./handlers/player_spawn');
require('./handlers/game_init');
require('./handlers/positioning');
require('./handlers/game_update');
require('./handlers/attack_damage');
