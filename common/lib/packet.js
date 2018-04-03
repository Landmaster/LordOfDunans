const Packet = {};

// TODO make sure to assign all subclasses here

Object.assign(Packet, require('./packets/accounts_packets'));
Object.assign(Packet, require('./packets/entity_spawn_packets'));
Object.assign(Packet, require('./packets/player_spawn_packets'));
Object.assign(Packet, require('./packets/game_init_packets'));
Object.assign(Packet, require('./packets/positioning_packets'));
Object.assign(Packet, require('./packets/game_update_packets'));
Object.assign(Packet, require('./packets/attack_damage_packets'));

module.exports = Packet;
