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
PacketHandler.register(0x0041, Packet.controlPlayerPacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.SERVER) {
		let player = mainInstance.getPlayerFromWS(ctx.ws);
		if (player) {
			if (packet.doStop) {
				player.movementDirections.delete(packet.direction);
			} else {
				player.movementDirections.add(packet.direction);
			}
		}
	}
});
PacketHandler.register(0x0042, Packet.playerVelocityPacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.CLIENT) {
		if (mainInstance.theWorld) {
			let player = mainInstance.theWorld.players.get(UuidUtils.bytesToUuid(new Uint8Array(packet.uuid.toBuffer())));
			if (player) {
				player.velocity = packet.velocity;
			}
		}
	}
});
PacketHandler.register(0x0043, Packet.playerRotationPacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.CLIENT) {
		if (mainInstance.theWorld) {
			let uuidBytes = new Uint8Array(packet.uuid.toBuffer());
			packet.uuid = uuidBytes;
			let player = mainInstance.theWorld.players.get(UuidUtils.bytesToUuid(uuidBytes));
			if (player) {
				player.yaw = packet.yaw;
				player.pitch = packet.pitch;
			}
		}
	} else { // For user controls.
		let uuidBytes = new Uint8Array(packet.uuid.toBuffer());
		packet.uuid = uuidBytes;
		let player = mainInstance.getPlayerFromWS(ctx.ws);
		if (player && UuidUtils.bytesToUuid(player.uuid) === UuidUtils.bytesToUuid(uuidBytes)) {
			player.yaw = packet.yaw;
			player.pitch = packet.pitch;
			player.world.players.forEach(individual => void(PacketHandler.sendToEndpoint(packet, individual.ws)));
		}
	}
});