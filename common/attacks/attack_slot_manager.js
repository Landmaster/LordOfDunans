/**
 * @author Landmaster
 */

const Side = require('common/lib/side');
const PacketHandler = require('common/lib/packethandler');
const Packet = require('common/lib/packet');

/**
 *
 * @constructor
 */
function AttackSlotManager() {
	/**
	 *
	 * @type {Array.<?Function>}
	 */
	this.attacks = new Array(AttackSlotManager.SLOT_NAMES.length);
}

AttackSlotManager.SLOT_NAMES = ['neutral', 'forward', 'up', 'down',
	'neutral2', 'forward2', 'up2', 'down2',];

AttackSlotManager.registerHandlers = function (mainInstance) {
	if (Side.getSide() === Side.CLIENT) {
		const Mousetrap = require('mousetrap');
		Mousetrap.bind('e', () => {
			mainInstance.sendToServer(new Packet.requestAttackPacket1());
		});
	}
};
AttackSlotManager.unregisterHandlers = function (mainInstance) {
	if (Side.getSide() === Side.CLIENT) {
		const Mousetrap = require('mousetrap');
		Mousetrap.unbind('e');
	}
};

module.exports = AttackSlotManager;
