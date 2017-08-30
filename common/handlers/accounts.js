/**
 * @author Landmaster
 */

const Side = require('common/lib/side');
const PacketHandler = require('common/lib/packethandler');
const Packet = require('common/lib/packet');
const Player = require('common/player');
const EmptyWorld = require('common/menu/empty_world');
const sprintf = require('sprintf-js').sprintf;

PacketHandler.register(0x0, Packet.loginPacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.SERVER) {
		const Accounts = require('server/accounts/accounts');
		const AccountError = require('server/accounts/account_error');
		
		(new Accounts(mainInstance)).authAccount(packet.uname, packet.pword).then((res) => {
			mainInstance.addClient(new Player(new EmptyWorld(mainInstance), ctx.ws, mainInstance, res));
			PacketHandler.sendToEndpoint(new Packet.accountSuccessPacket(res.uname, res.uuid), ctx.ws);
		}).catch(AccountError, e => {
			PacketHandler.sendToEndpoint(new Packet.accountErrorPacket(e, false), ctx.ws);
		}).catch(e => {
			PacketHandler.sendToEndpoint(
				new Packet.accountErrorPacket(new AccountError('$error_internal_server'), false), ctx.ws);
			throw e;
		});
	}
});

PacketHandler.register(0x1, Packet.registerPacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.SERVER) {
		const Accounts = require('server/accounts/accounts');
		const AccountError = require('server/accounts/account_error');
		
		(new Accounts(mainInstance)).addAccount(packet.uname, packet.pword).then((res) => {
			mainInstance.addClient(new Player(new EmptyWorld(mainInstance), ctx.ws, mainInstance, res));
			PacketHandler.sendToEndpoint(new Packet.accountSuccessPacket(res.uname, res.uuid), ctx.ws);
		}).catch(AccountError, e => {
			PacketHandler.sendToEndpoint(new Packet.accountErrorPacket(e, true), ctx.ws);
		}).catch(e => {
			PacketHandler.sendToEndpoint(
				new Packet.accountErrorPacket(new AccountError('$error_internal_server'), true), ctx.ws);
			throw e;
		});
	}
});

PacketHandler.register(0x2, Packet.accountErrorPacket, (packet, mainInstance) => {
	if (Side.getSide() === Side.CLIENT) {
		if (mainInstance.theWorld instanceof EmptyWorld) {
			packet.locParams[0] = packet.locParams[0].toLocaleString();
			mainInstance.theWorld.loginErrors = [sprintf.apply(null, packet.locParams)];
			mainInstance.theWorld.openLRDialog(packet.isRegister);
		}
	}
});

PacketHandler.register(0x3, Packet.accountSuccessPacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.CLIENT) {
		mainInstance.setPlayer(new Player(mainInstance.theWorld, ctx.ws, mainInstance,
			{uuid: new Uint8Array(packet.uuid.toBuffer()), uname: packet.uname}));
	}
});

// The logout packet is bidirectional.
PacketHandler.register(0x4, Packet.logoutPacket, (packet, mainInstance, ctx) => {
	if (Side.getSide() === Side.CLIENT) {
		mainInstance.setPlayer(null);
	} else {
		mainInstance.removeClientByUUID(mainInstance.getUUIDFromWS(ctx.ws));
		PacketHandler.sendToEndpoint(new Packet.logoutPacket(), ctx.ws);
	}
});