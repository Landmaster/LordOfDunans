/**
 * @author Landmaster
 */

const PacketHandler = require('common/lib/packethandler');
const Packet = require('common/lib/packet');
const Side = require('common/lib/side');
const UuidUtils = require("common/lib/uuid_utils");

PacketHandler.register(0x0040, Packet.playerPositionPacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.CLIENT) {
		if (mainInstance.theWorld) {
			let player = mainInstance.theWorld.players.get(UuidUtils.bytesToUuid(new Uint8Array(packet.uuid.toBuffer())));
			if (player) {
				player.pos = packet.pos;
			}
		}
	}
});