/**
 * @author Landmaster
 */

const PacketHandler = require('common/lib/packethandler');
const Packet = require('common/lib/packet');
const Side = require('common/lib/side');
const UuidUtils = require('common/lib/uuid_utils');

PacketHandler.register(0x0010, Packet.entitySpawnedPacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.CLIENT && mainInstance.theWorld) {
		const ent = packet.newEntity(mainInstance.theWorld);
		mainInstance.theWorld.nonPlayerEntities.set(UuidUtils.bytesToUuid(packet.uuid), ent);
	}
});

PacketHandler.register(0x0011, Packet.entityDeathPacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.CLIENT && mainInstance.theWorld) {
		mainInstance.theWorld.nonPlayerEntities.delete(packet.uuid);
	}
});