/**
 * @author Landmaster
 */

const PacketHandler = require('common/lib/packethandler');
const Packet = require('common/lib/packet');
const Side = require('common/lib/side');
const UuidUtils = require('common/lib/uuid_utils');

PacketHandler.register(0x0050, Packet.updateCrystalPacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.CLIENT) {
		let player = mainInstance.theWorld.players.get(UuidUtils.bytesToUuid(
			new Uint8Array(packet.playerUUID.toBuffer())));
		if (player) {
			for (let crystalName in player.crystals) {
				if (player.crystals.hasOwnProperty(crystalName)) {
					player.crystals[crystalName] = packet.crystals[crystalName];
				}
			}
		}
		player.markCrystalsForUpdate();
	}
});