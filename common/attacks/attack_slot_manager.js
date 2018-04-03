/**
 * @author Landmaster
 */

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

module.exports = AttackSlotManager;
