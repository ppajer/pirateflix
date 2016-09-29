const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
// Path to templates folder
const templatesPath = `file://${__dirname}/templates/`;

/*
    HELPERS
*/

function getTemplate(template) {
  return templatesPath+template+'.html';
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Keep "traffic lights" controls on OS X
  if (process.platform !== 'darwin') {
    mainWindow = new BrowserWindow({width: 1280, height: 720, frame: false, show: false})
  } else {
    mainWindow = new BrowserWindow({width: 1280, height: 720, titleBarStyle: 'hidden', show: false})
  }
  // and load the index.html of the app.
  mainWindow.loadURL(getTemplate('index'));

  // Show after DOM is loaded to avoid ugliness
  mainWindow.on('ready-to-show', function() {
    mainWindow.show();
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
