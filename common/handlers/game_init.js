/**
 * @author Landmaster
 */

const PacketHandler = require('common/lib/packethandler');
const Packet = require('common/lib/packet');
const Side = require('common/lib/side');
const Promise = require('bluebird');
const EmptyWorld = require('common/menu/empty_world');
const PreparationWorld = require('common/menu/prep_world');

PacketHandler.register(0x9, Packet.playPacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.SERVER) {
		const findRandomOpponent = require('server/algo/random_player');
		
		if (mainInstance.getUUIDFromWS(ctx.ws)) {
			const player = mainInstance.getPlayerFromWS(ctx.ws);
			console.log('Playing! '+player.uname);
			
			findRandomOpponent(mainInstance, player, 5000)
			.then((list) => {
				PacketHandler.sendToEndpoint(new Packet.playListPacket(list), ctx.ws); // send the player data to the client
			})
			.catch(Promise.TimeoutError, e => {
				console.log('Timed out');
				PacketHandler.sendToEndpoint(new Packet.timeoutPacket(), ctx.ws);
			});
		}
	}
});
PacketHandler.register(0xA, Packet.timeoutPacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.CLIENT) {
		const newWorld = new EmptyWorld(mainInstance);
		if (mainInstance.thePlayer) {
			mainInstance.thePlayer.despawn(mainInstance.theWorld);
			mainInstance.thePlayer.spawn(newWorld);
		}
		mainInstance.setWorld(newWorld);
		
		const vex = require('vex-js');
		vex.dialog.alert('$error_timeout'.toLocaleString());
	}
});
PacketHandler.register(0xB, Packet.playListPacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.CLIENT) {
		for (let player of packet.getPlayers(mainInstance)) {
			if (player !== mainInstance.thePlayer && mainInstance.theWorld instanceof PreparationWorld) {
				player.spawn(mainInstance.theWorld);
			}
		}
	}
});