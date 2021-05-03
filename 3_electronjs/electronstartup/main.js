const { app, BrowserWindow } = require('electron')
const isDev = require('electron-is-dev');   
const path = require('path')

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
		nodeIntegration: true,
  //    preload: path.join(__dirname, 'preload.js')
    }
  })
  const startURL = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`;
 
  win.loadURL(startURL);

 if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }
 
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

