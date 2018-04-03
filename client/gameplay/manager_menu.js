/**
 * @author Landmaster
 */

const AttackRegistry = require('common/attack_registry');
const AttackSlotManager = require('common/attacks/attack_slot_manager');
const Packet = require('common/lib/packet');

const ManagerMenu = {};

let isMenuOpen = false;

ManagerMenu.isOpen = function () {
	return isMenuOpen;
};

/**
 *
 * @param {number} idx
 * @param {Function} attack
 */
ManagerMenu.updateActiveAttack = function (idx, attack) {
	if (ManagerMenu.isOpen()) {
		let activeAttacksList = document.getElementById("active_attacks_list");
		if (activeAttacksList) {
			let activeAttacksNodes = activeAttacksList.querySelectorAll(".attack_desc");
			let desiredNode = activeAttacksNodes[idx];
			
			if (attack) {
				desiredNode.classList.remove("vacant");
				desiredNode.textContent = ("$attack_" + attack.unlocName).toLocaleString();
			} else {
				desiredNode.classList.add("vacant");
				desiredNode.innerHTML = "";
			}
			
			let descSpan = document.createElement("div");
			descSpan.classList.add('attack_meta');
			descSpan.textContent = ("$attack_slot_" + AttackSlotManager.SLOT_NAMES[idx]).toLocaleString();
			desiredNode.insertBefore(descSpan, desiredNode.childNodes[0] || null);
		}
	}
};

/**
 * Open the Manager Menu.
 */
ManagerMenu.open = function (mainInstance) {
	if (!isMenuOpen) {
		isMenuOpen = true;
		
		let managerMenu = document.getElementById("manager_menu");
		
		// TODO add manager menu options
		let attacksHeader = document.createElement("h2");
		attacksHeader.textContent = "$gui_attacks".toLocaleString();
		managerMenu.appendChild(attacksHeader);
		
		let attacksList = document.createElement("div");
		attacksList.id = "attacks_list";
		//attacksList.classList.add("clear_fix");
		
		let attacks = mainInstance.thePlayer.characterType.learnSet(mainInstance.thePlayer.characterData);
		attacks.forEach(atk => {
			let attackDesc = document.createElement("div");
			attackDesc.classList.add("attack_desc");
			attackDesc.textContent = ("$attack_" + atk.unlocName).toLocaleString();
			
			attackDesc.draggable = true;
			attackDesc.addEventListener("dragstart", event => {
				event.dataTransfer.setData("text/plain", atk.unlocName);
				event.dataTransfer.effectAllowed = "copy";
			});
			
			attacksList.appendChild(attackDesc);
		});
		
		managerMenu.appendChild(attacksList);
		
		let attacksSubHeader = document.createElement("h3");
		attacksSubHeader.textContent = "$gui_active_attacks".toLocaleString();
		managerMenu.appendChild(attacksSubHeader);
		
		let activeAttacksList = document.createElement("div");
		activeAttacksList.id = "active_attacks_list";
		//activeAttacksList.classList.add("clear_fix");
		managerMenu.appendChild(activeAttacksList);
		
		let attackManager = mainInstance.thePlayer.characterData.attackManager;
		
		for (let idx=0; idx<attackManager.attacks.length; ++idx) {
			let activeAttackDesc = document.createElement("div");
			activeAttackDesc.classList.add("attack_desc");
			
			activeAttacksList.appendChild(activeAttackDesc);
			
			ManagerMenu.updateActiveAttack(idx, attackManager.attacks[idx]);
			
			activeAttackDesc.addEventListener("dragover", event => {
				event.preventDefault();
				event.dataTransfer.dropEffect = "copy";
			});
			activeAttackDesc.addEventListener("drop", event => {
				event.preventDefault();
				//console.log(event.dataTransfer.getData("text/plain"));
				let attackName = event.dataTransfer.getData("text/plain");
				mainInstance.sendToServer(new Packet.updateAttackPacket(mainInstance.thePlayer.uuid, idx, attackName));
			});
		}
		
		document.exitPointerLock();
		
		managerMenu.style.display = "";
	}
};

/**
 * Close the Manager Menu.
 */
ManagerMenu.close = function (mainInstance) {
	if (isMenuOpen) {
		isMenuOpen = false;
		
		let managerMenu = document.getElementById("manager_menu");
		managerMenu.innerHTML = "";
		managerMenu.style.display = "none";
	}
};

ManagerMenu.toggle = function (mainInstance) {
	(ManagerMenu.isOpen() ? ManagerMenu.close : ManagerMenu.open)(mainInstance);
};

module.exports = ManagerMenu;