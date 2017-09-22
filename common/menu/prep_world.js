/**
 * @author Landmaster
 */

const World = require('common/world');
const Side = require('common/lib/side');
const EventBus = require('eventbusjs');
const PlayerAddedEvent = require('common/events/player_added');
const PlayerRemovedEvent = require('common/events/player_removed');
const SetCharacterTypeEvent = require('common/events/set_character_type');
const CharacterRegistry = require('common/character_types/character_registry_default');
const CharacterTypeBase = require('common/character_types/character_type_base');
const UuidUtils = require("common/lib/uuid_utils");
const Packet = require("common/lib/packet");
const sp = require('sprintf-js');

/**
 * 
 * @param {Server|Dunans} mainInstance the main instance
 * @constructor
 */
function PreparationWorld(mainInstance) {
	World.call(this, mainInstance);
	if (Side.getSide() === Side.CLIENT) {
		this.initScene();
		
		/**
		 * Match review HTML div.
		 * @type {Element}
		 */
		this.matchReview = document.getElementById("match_review");
		
		this.htmlElementsToToggle.push(this.matchReview);
		
		this._updateMatchReview();
	}
}

PreparationWorld.prototype = Object.create(World.prototype, {
	constructor: {
		value: PreparationWorld,
		writable: true,
		configurable: true
	}
});

if (Side.getSide() === Side.CLIENT) {
	PreparationWorld.prototype.initScene = function () {
		const BABYLON = require('babylonjs');
		
		// setup camera
		this.camera.position = new BABYLON.Vector3(13,5,0);
		this.camera.setTarget(BABYLON.Vector3.Zero());
		
		// for the ground
		this.ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 128, height: 128}, this.scene);
		const groundMat = new BABYLON.StandardMaterial("ground_mat", this.scene);
		groundMat.diffuseColor = new BABYLON.Color3(0, 0.6, 0);
		this.ground.material = groundMat;
		
		// lights on!
		this.light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(-1, 1, 0), this.scene);
		this.light.intensity = 0.5;
	};
	
	/**
	 * Updates the match review GUI with the players.
	 * @private
	 */
	PreparationWorld.prototype._updateMatchReview = function () {
		this.matchReview.innerHTML = ""; // reset the element
		
		if (this.players.size >= 2) { // i.e. the players have been selected
			let _promptHeading = document.createElement("h1");
			_promptHeading.classList.add('prompt_heading');
			_promptHeading.textContent = '$prompt_choose_character'.toLocaleString();
			this.matchReview.appendChild(_promptHeading);
			
			let counter = 0;
			for (let player of this.players.values()) {
				if (++counter > 2) break; // do not go over 2 players
				
				let _playerBody = document.createElement("div");
				_playerBody.classList.add("player_review");
				_playerBody.dataset.player = UuidUtils.bytesToUuid(player.uuid);
				
				let _nameReview = document.createElement("h2");
				_nameReview.classList.add("name_review");
				_nameReview.textContent = player.uname;
				_playerBody.appendChild(_nameReview);
				
				if (player === this.mainInstance.thePlayer) {
					let _chosenCharacterHeader = document.createElement("p");
					_chosenCharacterHeader.classList.add("chosen_character_header");
					_playerBody.appendChild(_chosenCharacterHeader);
					
					let _characterSelection = document.createElement("div");
					_characterSelection.classList.add("character_selection");
					
					for (let [str, char] of CharacterRegistry.getEntries()) {
						let _characterMark = document.createElement("img");
						_characterMark.dataset.character = str;
						_characterMark.classList.add("character_mark");
						_characterMark.src = char.avatarImage();
						_characterMark.alt = ('$character_'+str).toLocaleString();
						_characterMark.addEventListener("click", () => {
							this.mainInstance.sendToServer(new Packet.setCharacterTypePacket(this.mainInstance.thePlayer.uuid, str));
						});
						_characterSelection.appendChild(_characterMark);
					}
					
					_playerBody.appendChild(_characterSelection);
				}
				
				this.matchReview.appendChild(_playerBody); // Only append the element at the end, to minimize the amount of needed DOM updates.
			}
			
			let _startButton = document.createElement("img");
			_startButton.classList.add('start_button');
			_startButton.src = '$image_start'.toLocaleString();
			_startButton.alt = '$image_start_desc'.toLocaleString();
			this.matchReview.appendChild(_startButton);
			
			this._updateChosenCharacter();
		} else {
			let _loadingMeter = document.createElement("div");
			_loadingMeter.classList.add("loading_meter");
			
			let _loadingCircle = document.createElement("img");
			_loadingCircle.src = "/assets/images/loading.svg";
			_loadingMeter.appendChild(_loadingCircle);
			
			this.matchReview.appendChild(_loadingMeter);
		}
	};
	
	PreparationWorld.prototype._updateChosenCharacter = function () {
		const escapeHtml = require('client/lib/dom/escape_html');
		
		let uuidString = UuidUtils.bytesToUuid(this.mainInstance.thePlayer.uuid);
		let _playerBodies = document.getElementsByClassName('player_review');
		let characterIdentifier = CharacterRegistry.getCharacterIdentifier(
			this.mainInstance.thePlayer.characterType);
		
		for (let _playerBody of _playerBodies) {
			if (_playerBody.dataset.player === uuidString) {
				let _chosenCharacterHeaders = _playerBody.getElementsByClassName('chosen_character_header');
				for (let _chosenCharacterHeader of _chosenCharacterHeaders) {
					_chosenCharacterHeader.innerHTML = sp.sprintf(
						escapeHtml('$prep_chosen_character'.toLocaleString()),
						'<span class="chosen_character_display">'
						+ escapeHtml(characterIdentifier ? ('$character_' + characterIdentifier).toLocaleString() : ''))
						+ '</span>';
				}
				
				let _characterMarks = _playerBody.getElementsByClassName('character_mark');
				for (let _characterMark of _characterMarks) {
					if (_characterMark.dataset.character === characterIdentifier) {
						_characterMark.classList.add('chosen');
					} else {
						_characterMark.classList.remove('chosen');
					}
				}
			}
		}
	};
	
	const playerUpdateHandler = function (ev, data) {
		if (data.world instanceof PreparationWorld) {
			if (data instanceof PlayerAddedEvent) {
				data.player.setCharacterType(CharacterTypeBase.EMPTY);
			}
			data.world._updateMatchReview();
		}
	};
	
	EventBus.addEventListener(PlayerAddedEvent.NAME, playerUpdateHandler);
	EventBus.addEventListener(PlayerRemovedEvent.NAME, playerUpdateHandler);
	
	EventBus.addEventListener(SetCharacterTypeEvent.NAME, (ev, data) => {
		if (data.player.world instanceof PreparationWorld) {
			if (data.player === data.player.mainInstance.thePlayer) {
				data.player.world._updateChosenCharacter();
			}
		}
	});
}

module.exports = PreparationWorld;