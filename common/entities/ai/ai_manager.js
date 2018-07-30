/**
 * @author Landmaster
 */

const Side = require('common/lib/side');

function AIManager(entity) {
	this.entity = entity;
	
	/**
	 *
	 * @type {Entity|Player|null}
	 */
	this.aiTarget = null;
	
	/**
	 *
	 * @type {Array.<AIBase>}
	 */
	this.aiList = [];
	
	/**
	 *
	 * @type {Array.<AIBase>}
	 */
	this.targetAiList = [];
	
	/**
	 *
	 * @type {?AIBase}
	 */
	this.runningAI = null;
	
	/**
	 *
	 * @type {?AIBase}
	 */
	this.runningTargetAI = null;
}

if (Side.getSide() === Side.SERVER) {
	AIManager.prototype.updateTick = function (delta) {
		if (this.runningTargetAI) {
			if (!this.runningTargetAI.shouldContinue()) {
				this.runningTargetAI = null;
			}
		}
		if (!this.runningTargetAI) {
			for (let ai of this.targetAiList) {
				if (ai.canRun()) {
					this.runningTargetAI = ai;
					break;
				}
			}
		}
		if (this.runningTargetAI) {
			this.runningTargetAI.updateTick(delta);
		}
		
		
		if (this.runningAI) {
			if (!this.runningAI.shouldContinue()) {
				this.runningAI = null;
			}
		}
		if (!this.runningAI) {
			for (let ai of this.aiList) {
				if (ai.canRun()) {
					this.runningAI = ai;
					break;
				}
			}
		}
		if (this.runningAI) {
			//if (this.entity.world.elapsedTicks % 60 === 0) console.log("Teehee!", this.runningAI);
			this.runningAI.updateTick(delta);
		}
		
		//if (this.entity.world.elapsedTicks % 60 === 0) console.log(this.runningAI, this.runningTargetAI);
	};
}

module.exports = AIManager;
