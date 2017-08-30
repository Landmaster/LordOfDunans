'use strict';

const Promise = require('bluebird');
const express = require('express');
const fs = Promise.promisifyAll(require('fs'));
const mongo = require('mongodb');
const sprintf = require('sprintf-js').sprintf;
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const UuidUtils = require('common/lib/uuid_utils');
const PacketHandler = require('common/packethandler_registrar');

function Server(app, port, root, databaseFormat) {
	this.expressWS = require('express-ws')(app);
	
	root = root || process.cwd();
	this.root = root;
	
	/**
	 * @type {Promise}
	 */
	this.db = fs.readFileAsync(root+'/private/auth.json', 'utf-8').then((content) => {
		const parsedContent = JSON.parse(content);
		return mongo.MongoClient.connect(
			sprintf(databaseFormat || 'mongodb://%s:%s@localhost:27017/lordofdunans', 'loginManager', parsedContent['loginManager']), {
				promiseLibrary: Promise
			});
	});
	this.app = app;
	
	this.app.use(require('helmet')());
	
	this.app.use(session({
		secret: fs.readFileSync(root+'/private/session_info.txt', 'utf-8'),
		name: 'session',
		store: new MongoStore({ dbPromise: this.db }),
		cookie: { maxAge: 1000*60*60*24*30 },
		resave: false,
		saveUninitialized: false,
	}));
	
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
	 * Holds the players waiting for opponents.
	 * @type {Map.<Player, Deferred>}
	 */
	this.pendingPlayers = new Map();
	
	/**
	 * WebSocket to uuid string
	 * @type {WeakMap.<WebSocket, String>}
	 */
	this.wsToUuidString = new WeakMap();
	
	this.app.ws('/socket', (ws, req) => {
		ws.isAlive = true;
		ws.on('pong', () => ws.isAlive = true);
		
		// use the packet handler system
		ws.on('message', data => {
			PacketHandler.handle(data, this, {ws: ws, req: req});
		});
		// cleanup
		ws.on('close', () => {
			const uuidString = this.wsToUuidString.get(ws);
			if (uuidString) this.removeClientByUUID(this.wsToUuidString.get(ws));
		});
	});
	
	this.pongInterval = setInterval(() => {
		this.expressWS.getWss().clients.forEach(ws => {
			if (ws.isAlive === false) return ws.terminate();
			
			ws.isAlive = false;
			ws.ping('', false, true);
		});
	}, 30000);
	
	this.app.listen(port, () => {
		console.log('Starting server on port ' + port);
	});
}

/**
 *
 * @param {Player} client
 */
Server.prototype.addClient = function addClient(client) {
	const uuidString = UuidUtils.bytesToUuid(client.uuid);
	this.clientMap.set(uuidString, client);
	this.wsToUuidString.set(client.ws, uuidString);
	client.spawn(client.world);
};

Server.prototype.getUUIDFromWS = function getUUIDFromWS(ws) {
	return this.wsToUuidString.get(ws);
};

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
 */
Server.prototype.removeClientByUUID = function removeClientByUUID(uuid) {
	const uuidString = typeof uuid === 'string' ? uuid : UuidUtils.bytesToUuid(uuid);
	const player = this.clientMap.get(uuidString);
	if (player) {
		player.despawn();
		this.pendingPlayers.delete(player);
		this.clientMap.delete(uuidString);
		this.wsToUuidString.delete(player.ws);
	}
};

Server.prototype.sendToAllLoggedIn = function sendToAllLoggedIn (message) {
	const buf = PacketHandler.stream(message);
	this.clientMap.forEach(client => client.ws.send(buf));
};

module.exports = Server;