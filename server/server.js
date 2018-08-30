'use strict';

const Player = require('common/player');
const Promise = require('bluebird');
const express = require('express');
const fs = Promise.promisifyAll(require('fs'));
const mongo = require('mongodb');
const sprintf = require('sprintf-js').sprintf;
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const UuidUtils = require('common/lib/uuid_utils');
const PacketHandler = require('common/packethandler_registrar');
const EventBus = require('eventbusjs');
const PlayerDisconnectedEvent = require('common/events/player_disconnected');
const PairingSet = require('common/algo/pairing_set');
const Packet = require("common/lib/packet");
const winston = require('winston');
const Accounts = require('server/accounts/accounts');
const AccountError = require('server/accounts/account_error');
const EmptyWorld = require('common/menu/empty_world');
const WebSocket = require('ws');
require('common/character_types/character_registry_default');
require('common/attacks/attack_registry_default');

function Server(app, port, root, databaseFormat) {
	root = root || process.cwd();
	this.root = root;
	
	/**
	 * @type {Promise}
	 */
	this.db = mongo.MongoClient.connect(
		sprintf(databaseFormat || 'mongodb://%s:%s@localhost:27017/lordofdunans', 'loginManager', process.env.LOD_LOGIN_MANAGER), {
			promiseLibrary: Promise,
			useNewUrlParser: true
		}).then((client) => client.db('lordofdunans'));
	this.app = app;
	
	this.app.use(require('helmet')());
	
	const sessionHandler = session({
		secret: process.env.LOD_SESSION_TOKEN,
		name: 'session',
		store: new MongoStore({ dbPromise: this.db }),
		cookie: { maxAge: 1000*60*60*24*30 },
		resave: false,
		saveUninitialized: true,
	});
	
	this.app.use(sessionHandler);
	
	const forbidden = function (req, res, next) {
		res.status(403);
		res.send('<h1>403 Forbidden</h1>');
	};
	
	this.app.use('/private/*', forbidden);
	this.app.use('/server/*', forbidden);
	this.app.use('/db/*', forbidden);
	this.app.use('/node_modules/*', forbidden);
	
	this.app.use(express.static(root));
	
	/**
	 * string-encoded uuid to Player map
	 * @type {Map.<String, Player>}
	 */
	this.clientMap = new Map();
	
	/**
	 *
	 * @type {PairingSet.<Player>}
	 */
	this.pairedPlayers = new PairingSet();
	
	/**
	 * WebSocket to uuid string
	 * @type {WeakMap.<WebSocket, String>}
	 */
	this.wsToUuidString = new WeakMap();
	
	this.httpServer = this.app.listen(port, () => {
		winston.info('Starting server on port ' + port);
	});
	
	this.wss = new WebSocket.Server({server: this.httpServer});
	
	this.wss.on('connection', (ws, req) => {
		ws.isAlive = true;
		
		sessionHandler(req, {}, () => {
			if (req.session.uuid && !this.clientMap.has(req.session.uuid)) {
				const uuidBytes = Uint8Array.from(UuidUtils.uuidToBytes(req.session.uuid));
				new Accounts(this).getUsernameFromUUID(uuidBytes).then((uname) => {
					if (uname) {
						this.addClient(new Player(new EmptyWorld(this).load(), ws, this, {uname: uname, uuid: uuidBytes}));
						PacketHandler.sendToEndpoint(new Packet.accountSuccessPacket(uname, uuidBytes), ws);
					}
				});
			}
		});
		
		ws.on('pong', () => ws.isAlive = true);
		
		// use the packet handler system
		ws.on('message', data => {
			PacketHandler.handle(data, this, {ws: ws, req: req});
		});
		// cleanup
		ws.on('close', () => {
			const uuidString = this.wsToUuidString.get(ws);
			if (uuidString) this.removeClientByUUID(this.wsToUuidString.get(ws), req);
			
			if (!req.session.uuid) {
				req.session.destroy();
			}
		});
		
		ws.on('error', (e) => {
		});
	});
	
	this.pongInterval = setInterval(() => {
		this.wss.clients.forEach(ws => {
			if (ws.isAlive === false) return ws.terminate();
			
			ws.isAlive = false;
			ws.ping('', false, true);
		});
	}, 30000);
}

/**
 *
 * @param {Player} client
 */
Server.prototype.addClient = function addClient(client) {
	const uuidString = UuidUtils.bytesToUuid(client.uuid);
	if (this.clientMap.has(uuidString)) {
		throw new AccountError('$error_user_already_logged', client.uname);
	}
	this.clientMap.set(uuidString, client);
	this.wsToUuidString.set(client.ws, uuidString);
	client.spawn(client.world);
};

Server.prototype.getUUIDFromWS = function getUUIDFromWS(ws) {
	return this.wsToUuidString.get(ws);
};

/**
 *
 * @param ws the websocket
 * @return {?Player} the player
 */
Server.prototype.getPlayerFromWS = function getPlayerFromWS(ws) {
	const uuidString = this.getUUIDFromWS(ws);
	if (uuidString) {
		return this.clientMap.get(uuidString);
	} else {
		return null;
	}
};

/**
 * Remove a player with a given uuid.
 * @param {string|Uint8Array|Array.<number>} uuid
 * @param req
 * @param {?boolean} [explicitLogout]
 */
Server.prototype.removeClientByUUID = function removeClientByUUID(uuid, req, explicitLogout) {
	const uuidString = typeof uuid === 'string' ? uuid : UuidUtils.bytesToUuid(uuid);
	const uuidBytes = typeof uuid === 'string' ? UuidUtils.uuidToBytes(uuid) : uuid;
	const player = this.clientMap.get(uuidString);
	if (player) {
		player.despawn();
		EventBus.dispatch(PlayerDisconnectedEvent.NAME, this, new PlayerDisconnectedEvent(player));
		this.clientMap.delete(uuidString);
		this.wsToUuidString.delete(player.ws);
		let pair = this.pairedPlayers.getPair(player);
		if (pair) {
			for (let pairElem of pair) {
				if (pairElem === player) {
					this.pairedPlayers.deleteElem(pairElem);
				} else {
					let newWorld = new EmptyWorld(this).load();
					pairElem.despawn();
					pairElem.spawn(newWorld);
					PacketHandler.sendToEndpoint(new Packet.opponentDisconnectedPacket(uuidBytes), pairElem.ws);
				}
			}
		}
		
	}
	if (explicitLogout) {
		delete req.session.uuid;
		req.session.save();
	}
};

Server.prototype.sendToAllLoggedIn = function sendToAllLoggedIn (message) {
	const buf = PacketHandler.stream(message);
	this.clientMap.forEach(client => client.ws.send(buf));
};

module.exports = Server;