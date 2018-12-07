/**
 * @author Landmaster
 */

const PacketHandler = require('common/lib/packethandler');
const Packet = require('common/lib/packet');
const Side = require('common/lib/side');
const UuidUtils = require('common/lib/uuid_utils');
const MessageTypes = require('common/lib/message_types');
const IterTools = require('common/algo/iter_tools');

PacketHandler.register(0x0010, Packet.entitySpawnedPacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.CLIENT && mainInstance.theWorld) {
		const ent = packet.newEntity(mainInstance.theWorld);
		ent.spawn(mainInstance.theWorld);
	}
});

PacketHandler.register(0x0011, Packet.entityDespawnPacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.CLIENT && mainInstance.theWorld) {
		let stringedUUID = UuidUtils.bytesToUuid(new Uint8Array(packet.uuid.toBuffer()));
		let ent = mainInstance.theWorld.nonPlayerEntities.get(stringedUUID);
		if (ent) ent.despawn();
	}
});

PacketHandler.register(0x0012, Packet.summonEntityPacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.SERVER) {
		let player = mainInstance.getPlayerFromWS(ctx.ws);
		let entityClass = player.chosenTowers[packet.index];
		
		if (entityClass) { // undefined check
			for (let crystal in entityClass.prototype.towerCost) {
				if (entityClass.prototype.towerCost[crystal] > player.crystals[crystal]) {
					PacketHandler.sendToEndpoint(new Packet.sendFormattedMessagePacket(["$error_not_enough_crystals"], MessageTypes.ERROR), player.ws);
					return;
				}
			}
			
			let posPlusEyeHeight = player.pos.addTriple(0, player.getEyeHeight(), 0);
			
			let scaledPlayerLookVec = player.getLookVec().scale(player.getLookRange());
			
			let rtScaleFactor = player.world.rayTraceScaleFactor(posPlusEyeHeight, posPlusEyeHeight.add(scaledPlayerLookVec));
			
			//console.log(entityClass, rtScaleFactor);
			
			if (0 <= rtScaleFactor && rtScaleFactor <= 1.001) {
				let entity = new entityClass(player.world);
				entity.side = player.index;
				entity.pos = posPlusEyeHeight.add(scaledPlayerLookVec.scale(rtScaleFactor));
				
				if (entity.getBoundingBoxes().every(aabb => !player.world.entityAABBIntersect(aabb.addVec(entity.pos)).length)) {
					for (let crystal in entityClass.prototype.towerCost) {
						player.crystals[crystal] -= entityClass.prototype.towerCost[crystal];
					}
					
					PacketHandler.sendToEndpoint(new Packet.updateCrystalPacket(player.uuid, player.crystals), player.ws);
					
					entity.spawn(player.world);
				} else {
					PacketHandler.sendToEndpoint(new Packet.sendFormattedMessagePacket(["$error_place_bad_position"], MessageTypes.ERROR), player.ws);
				}
			}
		}
	}
});
