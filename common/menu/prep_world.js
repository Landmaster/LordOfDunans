/**
 * @author Landmaster
 */

const World = require('common/world');
const GameWorld = require('common/gameplay/game_world');
const Side = require('common/lib/side');
const EventBus = require('eventbusjs');
const PlayerAddedEvent = require('common/events/player_added');
const PlayerRemovedEvent = require('common/events/player_removed');
const SetCharacterTypeEvent = require('common/events/set_character_type');
const SetChosenTowersEvent = require('common/events/set_chosen_towers');
const CharacterRegistry = require('common/character_types/character_registry_default');
const CharacterTypeBase = require('common/character_types/character_type_base');
const UuidUtils = require("common/lib/uuid_utils");
const Packet = require("common/lib/packet");
const PacketHandler = require('common/lib/packethandler');
const sp = require('sprintf-js');
const EntityRegistry = require('common/entities/entity_registry_default');

/**
 * 
 * @param {Server|Dunans} mainInstance the main instance
 * @constructor
 */
function PreparationWorld(mainInstance) {
	World.call(this, mainInstance);
	
	this.timeRemaining = PreparationWorld.TIMER_LEN;
	
	/**
	 * Set of UUID of started players.
	 * @type {Set.<string>}
	 */
	this.lockedPlayers = new Set();
	
	if (Side.getSide() === Side.CLIENT) {
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

PreparationWorld.TIMER_LEN = 90*1000;

PreparationWorld.prototype.lockPlayer = function (playerUUID) {
	this.lockedPlayers.add(playerUUID);
};
PreparationWorld.prototype.unlockPlayer = function (playerUUID) {
	this.lockedPlayers.delete(playerUUID);
};
PreparationWorld.prototype.isPlayerLocked = function (playerUUID) {
	return this.lockedPlayers.has(playerUUID);
};

if (Side.getSide() === Side.CLIENT) {
	PreparationWorld.prototype.initScene = function () {
		World.prototype.initScene.call(this);
		
		const BABYLON = require('babylonjs');
		
		// setup camera
		this.camera.position = new BABYLON.Vector3(13,5,0);
		this.camera.setTarget(BABYLON.Vector3.Zero());
		
		// for the ground
		this.ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 1024, height: 1024}, this.scene);
		const groundMat = new BABYLON.StandardMaterial("ground_mat", this.scene);
		groundMat.diffuseColor = new BABYLON.Color3(0, 0.6, 0);
		this.ground.material = groundMat;
		this.sceneElementsToDispose.add(this.ground);
		
		// lights on!
		this.light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(-1, 1, 0), this.scene);
		this.light.intensity = 0.5;
		this.sceneElementsToDispose.add(this.light);
	};
	
	PreparationWorld.prototype.updateStartTimer = function () {
		let _startTimers = document.getElementsByClassName("start_timer");
		for (let _startTimer of _startTimers) {
			if (this.isPlayerLocked(UuidUtils.bytesToUuid(this.mainInstance.thePlayer.uuid))) {
				_startTimer.textContent = sp.sprintf('$start_wait'.toLocaleString(), Math.ceil(this.timeRemaining / 1000));
			} else {
				_startTimer.textContent = sp.sprintf('$start_timer'.toLocaleString(), Math.ceil(this.timeRemaining / 1000));
			}
		}
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
					
					let _towerHeader = document.createElement("p");
					_towerHeader.classList.add("tower_header");
					_towerHeader.textContent = "$prep_tower".toLocaleString();
					_playerBody.appendChild(_towerHeader);
					
					let _towerSelection = document.createElement("div");
					_towerSelection.classList.add("tower_selection");
					
					for (let towerClass of EntityRegistry.getTowers()) {
						const id = EntityRegistry.entityClassToId(towerClass);
						
						let _towerMark = document.createElement("div");
						_towerMark.dataset.tower = id;
						_towerMark.classList.add("tower_mark");
						_towerMark.style.backgroundImage = 'url("'+encodeURI(towerClass.prototype.towerIcon)+'")';
						_towerMark.style.backgroundSize = "contain";
						_towerMark.addEventListener("click", () => {
							this.mainInstance.sendToServer(new Packet.setTowerPacket(
								this.mainInstance.thePlayer.uuid, towerClass));
						});
						_towerSelection.appendChild(_towerMark);
					}
					
					_playerBody.appendChild(_towerSelection);
				}
				
				this.matchReview.appendChild(_playerBody); // Only append the element at the end, to minimize the amount of needed DOM updates.
			}
			
			let _startButton = document.createElement("div");
			_startButton.classList.add('start_button');
			_startButton.addEventListener("click", () => {
				if (this.mainInstance.thePlayer.verifyPlayable()) {
					this.mainInstance.sendToServer(new Packet.startGamePacket());
				}
			});
			
			let _startButtonImage = document.createElement("img");
			_startButtonImage.src = '$image_start'.toLocaleString();
			_startButtonImage.alt = '$image_start_desc'.toLocaleString();
			
			let _startButtonRemaining = document.createElement("div");
			_startButtonRemaining.classList.add("start_timer");
			
			_startButton.appendChild(_startButtonImage);
			_startButton.appendChild(_startButtonRemaining);
			
			this.matchReview.appendChild(_startButton);
			
			this._updateChosenCharacter();
			this.updateStartTimer();
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
	
	PreparationWorld.prototype._updateChosenTowers = function () {
		const escapeHtml = require('client/lib/dom/escape_html');
		
		let uuidString = UuidUtils.bytesToUuid(this.mainInstance.thePlayer.uuid);
		let _playerBodies = document.getElementsByClassName('player_review');
		
		for (let _playerBody of _playerBodies) {
			if (_playerBody.dataset.player === uuidString) {
				let _towerMarks = _playerBody.getElementsByClassName('tower_mark');
				for (let _towerMark of _towerMarks) {
					let _towerClass = EntityRegistry.entityClassFromId(_towerMark.dataset.tower);
					let idx = this.mainInstance.thePlayer.chosenTowers.indexOf(_towerClass);
					
					if (idx >= 0) {
						_towerMark.classList.add('chosen');
						_towerMark.dataset.index = idx+1;
					} else {
						_towerMark.classList.remove('chosen');
						delete _towerMark.dataset.index;
					}
				}
			}
		}
	};
	
	EventBus.addEventListener(SetCharacterTypeEvent.NAME, (ev, data) => {
		if (data.player.world instanceof PreparationWorld) {
			if (data.player === data.player.mainInstance.thePlayer) {
				data.player.world._updateChosenCharacter();
			}
		}
	});
	
	EventBus.addEventListener(SetChosenTowersEvent.NAME, (ev, data) => {
		if (data.player.world instanceof PreparationWorld) {
			if (data.player === data.player.mainInstance.thePlayer) {
				data.player.world._updateChosenTowers();
			}
		}
	});
} else {// #END Side.getSide() === Side.CLIENT
	PreparationWorld.prototype.updateTick = function updateTick (delta) {
		World.prototype.updateTick.call(this, delta);
		let prevFloor = Math.floor(this.timeRemaining);
		this.timeRemaining -= (1000 / World.TICKS_PER_SEC);
		if (Math.floor(this.timeRemaining) < prevFloor) {
			for (let player of this.players.values()) {
				PacketHandler.sendToEndpoint(new Packet.prepTimerPacket(this.timeRemaining), player.ws);
			}
		}
		if (this.timeRemaining <= 0) {
			const EmptyWorld = require('./empty_world');
			
			let willStart = true;
			for (let player of this.players.values()) {
				if (!player.verifyPlayable()) {
					willStart = false;
					break;
				}
			}
			if (!willStart) {
				for (let player of this.players.values()) {
					let isCauser = !player.verifyPlayable();
					player.despawn();
					player.spawn(new EmptyWorld(this.mainInstance).load());
					PacketHandler.sendToEndpoint(new Packet.notStartedInTimePacket(isCauser), player.ws);
				}
				this.unload();
			} else {
				this.doStart();
			}
		}
	};
	
	PreparationWorld.prototype.doStart = function () {
		let newWorld = new GameWorld(this.mainInstance);
		
		let characterTypePackets = [];
		let towerPackets = [];
		
		for (let player of this.players.values()) {
			characterTypePackets.push(new Packet.setCharacterTypePacket(player.uuid,
				CharacterRegistry.getCharacterIdentifier(player.characterType)));
			towerPackets.push(new Packet.setAllTowersPacket(player.uuid,
				...player.chosenTowers));
		}
		
		for (let player of this.players.values()) {
			player.despawn();
			player.spawn(newWorld.load());
			
			characterTypePackets.forEach(pkt => PacketHandler.sendToEndpoint(pkt, player.ws));
			towerPackets.forEach(pkt => PacketHandler.sendToEndpoint(pkt, player.ws));
			
			PacketHandler.sendToEndpoint(new Packet.startedGamePacket(), player.ws);
		}
	};
}

const playerUpdateHandler = (ev, data) => {
	if (data.world instanceof PreparationWorld) {
		if (data instanceof PlayerAddedEvent) {
			data.player.setCharacterType(CharacterTypeBase.EMPTY);
			data.player.clearChosenTowers();
		}
		if (Side.getSide() === Side.CLIENT) {
			data.world._updateMatchReview();
		}
	}
};

EventBus.addEventListener(PlayerAddedEvent.NAME, playerUpdateHandler);
EventBus.addEventListener(PlayerRemovedEvent.NAME, playerUpdateHandler);

module.exports = PreparationWorld;