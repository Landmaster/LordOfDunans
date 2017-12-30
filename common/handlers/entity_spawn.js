/**
 * @author Landmaster
 */

const PacketHandler = require('common/lib/packethandler');
const Packet = require('common/lib/packet');
const Side = require('common/lib/side');
const UuidUtils = require('common/lib/uuid_utils');

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
					// not enough crystals
					// TODO send notification to player
					return;
				}
			}
			
			let posPlusEyeHeight = player.pos.addTriple(0, player.getEyeHeight(), 0);
			
			let playerLookVec = player.getLookVec();
			
			let rtScaleFactor = player.world.rayTraceScaleFactor(posPlusEyeHeight, posPlusEyeHeight.add(playerLookVec.scale(7)));
			
			//console.log(entityClass, rtScaleFactor);
			
			if (0 <= rtScaleFactor && rtScaleFactor <= 1.001) {
				let entity = new entityClass(player.world);
				
				entity.pos = posPlusEyeHeight.add(playerLookVec.scale(7*rtScaleFactor));
				
				for (let crystal in entityClass.prototype.towerCost) {
					player.crystals[crystal] -= entityClass.prototype.towerCost[crystal];
				}
				
				PacketHandler.sendToEndpoint(new Packet.updateCrystalPacket(player.uuid, player.crystals), player.ws);
				
				entity.spawn(player.world);
			}
		}
	}
});
