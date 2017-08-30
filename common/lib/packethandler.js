const ByteBuffer = require('bytebuffer');
const Side = require('./side');

const PacketHandler = {};

/**
 * The maximum value of the discriminator short.
 * @type {number}
 */
PacketHandler.MAX_DISCRIMINATOR = 0xFFFF;

/**
 * Maps the packet constructor to the discriminator.
 * @type {Map.<Function,number>}
 */
const PacketToDiscriminator = new Map();
/**
 * Maps the discriminator short to the packet class.
 * @type {Array.<Function>}
 */
const DiscriminatorToPacket = new Array(PacketHandler.MAX_DISCRIMINATOR);
/**
 * Maps the discriminator short to the packet handler.
 * @type {Array.<messageHandler>}
 */
const DiscriminatorToHandler = new Array(PacketHandler.MAX_DISCRIMINATOR);

/**
 * @callback messageHandler
 * @param packet
 * @param {Server|Dunans} mainInstance
 * @param {Object} ctx the context
 * @param {WebSocket} ctx.ws the context's WebSocket
 * @param [ctx.req] the request (server only)
 */

/**
 * Register a handler for the packet type.
 * @param {number} discriminator the discriminator (as an unsigned short)
 * @param {Function} packetClass the packet class
 * @param {Function} packetClass.prototype.deserialize
 * @param {Function} packetClass.prototype.serialize
 * @param {messageHandler} handler the packet handler
 */
PacketHandler.register = function register(discriminator, packetClass, handler) {
	if ((discriminator & PacketHandler.MAX_DISCRIMINATOR) !== discriminator) {
		throw new RangeError('Discriminator should be between 0 and ' +
			PacketHandler.MAX_DISCRIMINATOR + ' inclusive; got ' + discriminator
			+ ' instead');
	}
	if (typeof DiscriminatorToPacket[discriminator] !== 'undefined') {
		throw new RangeError('Message with discriminator '+discriminator+' already registered');
	}
	PacketToDiscriminator.set(packetClass, discriminator);
	DiscriminatorToPacket[discriminator] = packetClass;
	DiscriminatorToHandler[discriminator] = handler;
};

/**
 * Handle a message.
 * @param {ByteBuffer} buf the byte data holding the message
 * @param {Server|Dunans} mainInstance the server or client instance
 * @param {Object} ctx the context
 * @param {WebSocket} ctx.ws the context's WebSocket
 * @param [ctx.req] the request (server only)
 */
PacketHandler.handle = function handle(buf, mainInstance, ctx) {
	const wrapped = ByteBuffer.wrap(buf);
	const discriminator = wrapped.readShort();
	const packet = DiscriminatorToPacket[discriminator];
	const handler = DiscriminatorToHandler[discriminator];
	const packetObj = new packet();
	packetObj.deserialize(wrapped);
	wrapped.flip();
	handler(packetObj, mainInstance, ctx);
};

/**
 * Convert a message to an {@link ArrayBuffer} for sending.
 * @param {Object} packetObj the message
 * @param {Function} packetObj.deserialize
 * @param {Function} packetObj.serialize
 * @returns {ArrayBuffer} the converted message
 */
PacketHandler.stream = function stream(packetObj) {
	const buf = new ByteBuffer();
	const discriminator = PacketToDiscriminator.get(packetObj.constructor); // the constructor is the type
	if (typeof discriminator === 'undefined') {
		throw new TypeError('Tried to convert '+packetObj+' to a byte buffer, but message type '
			+packetObj.constructor+' is not registered');
	}
	buf.writeShort(discriminator);
	packetObj.serialize(buf);
	return buf.flip().toArrayBuffer();
};

/**
 * Send a message to a specific endpoint.
 * @param {Object} message the message
 * @param {WebSocket} ws the WebSocket endpoint
 */
PacketHandler.sendToEndpoint = function sendToEndpoint (message, ws) {
	ws.send(PacketHandler.stream(message));
};

module.exports = PacketHandler;
