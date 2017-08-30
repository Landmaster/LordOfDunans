/**
 * @author Landmaster
 */

const PacketHandler = require('common/lib/packethandler');
const Packet = require('common/lib/packet');
const Side = require('common/lib/side');
const Promise = require('bluebird');
const EmptyWorld = require('common/menu/empty_world');

PacketHandler.register(0x9, Packet.playPacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.SERVER) {
		const findRandomOpponent = require('server/algo/random_player');
		
		if (mainInstance.getUUIDFromWS(ctx.ws)) {
			const player = mainInstance.getPlayerFromWS(ctx.ws);
			console.log('Playing! '+player.uname);
			
			findRandomOpponent(mainInstance, player, 5000)
			.then((list) => {
				if (player === list[0]) { // first player
					console.log(list.map(pl => pl.uname));
				}
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
		let newWorld = new EmptyWorld(mainInstance);
		if (this.thePlayer) {
			this.thePlayer.despawn(this.theWorld);
			this.thePlayer.spawn(newWorld);
		}
		mainInstance.setWorld(newWorld);
		
		const vex = require('vex-js');
		vex.dialog.alert('$error_timeout'.toLocaleString());
	}
});