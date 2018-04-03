/**
 * @author Landmaster
 */

const PacketHandler = require('common/lib/packethandler');
const Packet = require('common/lib/packet');
const Side = require('common/lib/side');
const UuidUtils = require('common/lib/uuid_utils');
const AttackRegistry = require('common/attack_registry');
const GameWorld = require('common/gameplay/game_world');

PacketHandler.register(0x0060, Packet.updatePlayerHPPacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.CLIENT) {
		let player = mainInstance.theWorld.players.get(UuidUtils.bytesToUuid(new Uint8Array(packet.playerUUID.toBuffer())));
		if (player) {
			player.hp = packet.hp;
		}
	}
});

PacketHandler.register(0x0061, Packet.updateAttackPacket, (packet, mainInstance, ctx) => {
	let player;
	if (Side.getSide() === Side.SERVER) {
		player = mainInstance.clientMap.get(UuidUtils.bytesToUuid(new Uint8Array(packet.playerUUID.toBuffer())));
	} else {
		player = mainInstance.theWorld.players.get(UuidUtils.bytesToUuid(new Uint8Array(packet.playerUUID.toBuffer())));
	}
	if (player && player.world instanceof GameWorld) {
		let attack = AttackRegistry.getAttack(packet.attackName);
		if (!attack || player.characterData.attackManager.attacks.indexOf(attack) < 0) {
			player.characterData.attackManager.attacks[packet.idx] = attack;
			if (Side.getSide() === Side.SERVER) {
				let replyPacket = new Packet.updateAttackPacket(player.uuid, packet.idx, packet.attackName);
				for (let worldPlayer of player.world.players.values()) {
					PacketHandler.sendToEndpoint(replyPacket, worldPlayer.ws)
				}
			} else {
				const ManagerMenu = require('client/gameplay/manager_menu');
				if (player === mainInstance.thePlayer) {
					ManagerMenu.updateActiveAttack(packet.idx, attack);
				}
			}
		}
	}
});
