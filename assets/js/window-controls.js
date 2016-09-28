// Get access to electron BrowserWindow methods
const ElectronRemote = require('electron').remote;

document.getElementById('btn-window-close').addEventListener('click', function(e) {
	ElectronRemote.getCurrentWindow().close();
});

document.getElementById('btn-window-minimize').addEventListener('click', function(e) {
	ElectronRemote.getCurrentWindow().minimize();
});

document.getElementById('btn-window-fullscreen').addEventListener('click', function(e) {
	ElectronRemote.getCurrentWindow().setFullScreen(!ElectronRemote.getCurrentWindow().isFullScreen());
})

document.getElementById('btn-window-home').addEventListener('click', function(e) {
	document.getElementById('mediaPlayer').pause();
	$('section.active').not('#controls').removeClass('active');
	$('#home').addClass('active');
})