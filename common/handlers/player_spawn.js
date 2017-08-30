/**
 * @author Landmaster
 */

const PacketHandler = require('common/lib/packethandler');
const Packet = require('common/lib/packet');
const Side = require('common/lib/side');

// TODO add handling

PacketHandler.register(0x7, Packet.playerSpawnedPacket, (packet, mainInstance, ctx) => {
});
PacketHandler.register(0x8, Packet.playerDeathPacket, (packet, mainInstance, ctx) => {
});