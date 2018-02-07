/**
 * @author Landmaster
 */

const PacketHandler = require('common/lib/packethandler');
const Packet = require('common/lib/packet');
const Side = require('common/lib/side');
const UuidUtils = require('common/lib/uuid_utils');
const GameWorld = require('common/gameplay/game_world');
const sp = require('sprintf-js');

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

PacketHandler.register(0x0051, Packet.sendMessagePacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.CLIENT) {
		if (mainInstance.theWorld instanceof GameWorld) {
			mainInstance.theWorld.addMessage(packet.message, packet.messageType);
		}
	}
});

PacketHandler.register(0x0052, Packet.sendFormattedMessagePacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.CLIENT) {
		if (mainInstance.theWorld instanceof GameWorld) {
			//console.log(packet);
			packet.locParams[0] = packet.locParams[0].toLocaleString();
			mainInstance.theWorld.addMessage(sp.sprintf(...packet.locParams), packet.messageType);
		}
	}
});
