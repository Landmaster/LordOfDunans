/**
 * @author Landmaster
 */

const PacketHandler = require('common/lib/packethandler');
const Packet = require('common/lib/packet');
const Side = require('common/lib/side');
const Promise = require('bluebird');
const EmptyWorld = require('common/menu/empty_world');
const PreparationWorld = require('common/menu/prep_world');
const CharacterRegistry = require("common/character_registry");
const UuidUtils = require("common/lib/uuid_utils");

PacketHandler.register(0x0030, Packet.playPacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.SERVER) {
		const winston = require('winston');
		const findRandomOpponent = require('server/algo/random_player');
		
		if (mainInstance.getUUIDFromWS(ctx.ws)) {
			const player = mainInstance.getPlayerFromWS(ctx.ws);
			
			if (player.world instanceof EmptyWorld) {
				winston.info(player.uname + ' playing');
				
				findRandomOpponent(mainInstance, player, 30000)
				.then((list) => {
					PacketHandler.sendToEndpoint(new Packet.playListPacket(list), ctx.ws); // send the player data to the client
				})
				.catch(Promise.TimeoutError, e => {
					PacketHandler.sendToEndpoint(new Packet.timeoutPacket(), ctx.ws);
				});
			}
		}
	}
});
PacketHandler.register(0x0031, Packet.timeoutPacket, (packet, mainInstance, ctx) => {
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
PacketHandler.register(0x0032, Packet.playListPacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.CLIENT) {
		if (mainInstance.theWorld instanceof PreparationWorld) {
			for (let player of packet.getPlayers(mainInstance)) {
				if (player === mainInstance.thePlayer) {
					player.despawn();
				}
				player.spawn(mainInstance.theWorld);
			}
		}
	}
});
PacketHandler.register(0x0033, Packet.setCharacterTypePacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.SERVER) {
		const player = mainInstance.getPlayerFromWS(ctx.ws);
		if (player.world instanceof PreparationWorld) {
			player.setCharacterType(CharacterRegistry.getCharacterType(packet.characterIdentifier));
			PacketHandler.sendToEndpoint(packet, ctx.ws); // send back the packet
		}
	} else {
		if (mainInstance.theWorld) {
			let player = mainInstance.theWorld.players.get(UuidUtils.bytesToUuid(new Uint8Array(packet.uuid.toBuffer())));
			if (player) {
				player.setCharacterType(CharacterRegistry.getCharacterType(packet.characterIdentifier));
			}
		}
	}
});
PacketHandler.register(0x0034, Packet.setTowerPacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.SERVER) {
		const player = mainInstance.getPlayerFromWS(ctx.ws);
		if (player.world instanceof PreparationWorld) {
			player.toggleChosenTower(packet.tower);
			PacketHandler.sendToEndpoint(new Packet.setAllTowersPacket(player.uuid, ...player.chosenTowers), ctx.ws);
		}
	}
});
PacketHandler.register(0x0035, Packet.setAllTowersPacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.CLIENT) {
		if (mainInstance.theWorld) {
			let player = mainInstance.theWorld.players.get(UuidUtils.bytesToUuid(new Uint8Array(packet.uuid.toBuffer())));
			if (player) {
				player.setChosenTowers(packet.towers);
			}
		}
	}
});
