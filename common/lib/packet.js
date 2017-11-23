const Packet = {};

Object.assign(Packet, require('./packets/accounts_packets'));
Object.assign(Packet, require('./packets/entity_spawn_packets'));
Object.assign(Packet, require('./packets/player_spawn_packets'));
Object.assign(Packet, require('./packets/game_init_packets'));
Object.assign(Packet, require('./packets/positioning_packets'));
Object.assign(Packet, require('./packets/game_update_packets'));

module.exports = Packet;
