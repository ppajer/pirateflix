const ElectronRemote = require('electron').remote;

function MediaController(player, customBindings) {

	this.keyCodes = {
			spacebar	: 32,
			leftArrow	: 37,
			upArrow		: 38,
			rightArrow	: 39,
			downArrow	: 40,
			escape		: 27
		};

	this.init = function(player, customBindings) {
		this.player 		= player;
		this.customBindings = customBindings || [];
		this.isPlaying 		= !this.player.paused;
		this.addEventHandlers(this);
	}

	this.addEventHandlers = function(handler) {
		handler.player.addEventListener('playing', handler.setPlayingFlag.bind(handler));
		handler.player.addEventListener('ended', handler.unsetPlayingFlag.bind(handler));
		document.addEventListener('keydown', handler.handleKeyDown.bind(handler));	
	}

	this.doActionIfBound = function(keycode) {
		for (var i = 0; i < this.customBindings.length; i++) {
			if (this.customBindings[i].key === keycode) this.customBindings[i].action.call().bind(this);
		};
	}

	this.handleKeyDown = function(e) {
		switch (e.which) {
			case this.keyCodes.spacebar:
				this.startOrPause();
				break;
			case this.keyCodes.escape:
				ElectronRemote.getCurrentWindow().minimize();
				break;
			case this.keyCodes.leftArrow:
				this.changePlaybackTime(-5);
				break;
			case this.keyCodes.rightArrow:
				this.changePlaybackTime(5);
				break;
			case this.keyCodes.downArrow:
				this.changeVolume(-0.05);
				break;
			case this.keyCodes.upArrow:
				this.changeVolume(0.05);
				break;
			default:
				this.doActionIfBound(e.which);
			break;
		}
	}

	this.setPlayingFlag = function(e) {
		this.isPlaying = true;
	}

	this.unsetPlayingFlag = function(e) {
		this.isPlaying = false;
	}

	this.startOrPause = function() {
		if (this.isPlaying) {
			this.pauseMedia();
			this.unsetPlayingFlag();
		} else {
			this.startMedia();
			this.setPlayingFlag();
		};
	}

	this.startMedia = function() {
		this.player.play();
	}

	this.pauseMedia = function() {
		this.player.pause();
	}

	this.changeVolume = function(diff) {
		this.player.volume = this.player.volume + diff;
	}

	this.changePlaybackTime = function(diff) {
		this.player.currentTime = this.player.currentTime + diff;
	}

	this.init(player, customBindings);
}

module.exports.getController = function(player, customBindings) {
	return new MediaController(player, customBindings);
}