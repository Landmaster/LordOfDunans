/**
 * @author Landmaster
 */

const bcrypt = require('bcrypt');
const mongo = require('mongodb');
const Promise = require('bluebird');

const toBuffer = require('typedarray-to-buffer');

const AccountError = require('./account_error');

/**
 * Create an account manager for a server.
 * @param {Server} server the server instance
 * @constructor
 */
function Accounts(server) {
	this.server = server;
}

Accounts.MIN_USERNAME_LENGTH = 4;
Accounts.MIN_PASSWORD_LENGTH = 10;

// This is due to bcrypt only accepting the first 72 characters.
Accounts.MAX_PASSWORD_LENGTH = 72;

Accounts.SALT_ROUNDS = 11;

Accounts.prototype.genUUID = function genUUID(usersColl) {
	const v4 = require('uuid/v4');
	
	const buf = new Buffer(16);
	
	const tryGenUUID = () => {
		let uuidBuf = v4(null, buf);
		return usersColl.findOne(
			{ _id: new mongo.Binary(toBuffer(uuidBuf), mongo.Binary.SUBTYPE_UUID) },
			{}
		).then((doc) => {
			if (doc) {
				return tryGenUUID();
			}
			return uuidBuf;
		});
	};
	
	return tryGenUUID();
};

/**
 * Authenticate a login.
 * @param uname the username
 * @param pword the password
 */
Accounts.prototype.authAccount = function authAccount(uname, pword) {
	uname = uname.normalize();
	pword = pword.normalize();
	
	return this.server.db.then(db => db.createCollection('users')).then((usersColl) => {
		return usersColl.findOne({uname: uname}, {_id: true, pword: true});
	}).then((doc) => {
		if (!doc) {
			throw new AccountError('$error_missing_username', uname);
		}
		return [doc._id, bcrypt.compare(pword, doc.pword)];
	}).spread((uuidMongo, hashCmp) => {
		if (!hashCmp) {
			throw new AccountError('$error_bad_password');
		}
		return { uuid: uuidMongo.read(0, 16), uname: uname };
	});
};

/**
 * Try to add an account.
 * @param {String} uname the username
 * @param {String} pword the password
 */
Accounts.prototype.addAccount = function addAccount(uname, pword) {
	uname = uname.normalize();
	pword = pword.normalize();
	
	if (uname.length < Accounts.MIN_USERNAME_LENGTH) {
		return Promise.reject(new AccountError('$error_short_username', uname, Accounts.MIN_USERNAME_LENGTH));
	}
	
	if (pword.length < Accounts.MIN_PASSWORD_LENGTH) {
		return Promise.reject(new AccountError('$error_short_password', Accounts.MIN_PASSWORD_LENGTH));
	} else if (pword.length > Accounts.MAX_PASSWORD_LENGTH) {
		return Promise.reject(new AccountError('$error_long_password', Accounts.MAX_PASSWORD_LENGTH));
	}
	
	return this.server.db.then(db => db.createCollection('users')).then((usersColl) => {
		return [usersColl, usersColl.findOne(
			{uname: uname},
			{}
		)];
	}).spread((usersColl, existingDoc) => {
		if (existingDoc) {
			throw new AccountError('$error_bad_username', uname);
		}
		return [this.genUUID(usersColl), usersColl, bcrypt.hash(pword, Accounts.SALT_ROUNDS)];
	}).spread((uuidBuf, usersColl, hash) => {
		return [uuidBuf, usersColl.insertOne({
			_id: new mongo.Binary(toBuffer(uuidBuf), mongo.Binary.SUBTYPE_UUID),
			uname: uname,
			pword: hash
		})];
	}).spread((uuidBuf) => {
		return { uuid: uuidBuf, uname: uname };
	});
};

Accounts.prototype.getUsernameFromUUID = function (uuid) {
	return this.server.db.then(db => db.createCollection('users')).then((usersColl) => {
		return usersColl.findOne({_id: new mongo.Binary(toBuffer(uuid), mongo.Binary.SUBTYPE_UUID)}, {uname: true});
	}).then((doc) => {
		if (!doc) {
			return null;
		}
		return doc.uname;
	});
};

module.exports = Accounts;