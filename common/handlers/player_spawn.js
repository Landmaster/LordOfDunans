/**
 * @author Landmaster
 */

const PacketHandler = require('common/lib/packethandler');
const Packet = require('common/lib/packet');
const Side = require('common/lib/side');
const EmptyWorld = require('common/menu/empty_world');
const PreparationWorld = require('common/menu/prep_world');

// TODO add handling

PacketHandler.register(0x0020, Packet.playerSpawnedPacket, (packet, mainInstance, ctx) => {
});
PacketHandler.register(0x0021, Packet.playerDeathPacket, (packet, mainInstance, ctx) => {
});
PacketHandler.register(0x0022, Packet.opponentDisconnectedPacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.CLIENT) {
		if (mainInstance.theWorld instanceof PreparationWorld) { // We were still preparing for a game
			const newWorld = new EmptyWorld(mainInstance);
			if (mainInstance.thePlayer) {
				mainInstance.thePlayer.despawn(mainInstance.theWorld);
				mainInstance.thePlayer.spawn(newWorld);
			}
			mainInstance.setWorld(newWorld);
			
			const vex = require('vex-js');
			vex.dialog.alert('$error_opponent_disconnected'.toLocaleString());
		}
	}
});