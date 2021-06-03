const { app, BrowserWindow, ipcMain, systemPreferences, dialog,Tray ,Menu} = require( 'electron' );
const path = require( 'path' );
const { autoUpdater } = require( 'electron-updater' );
const Positioner = require('electron-positioner');//electron-traywindow-positioner talvez seja melhor
const { isMainThread, parentPort,Worker  } = require('worker_threads');
// local dependencies
const io = require( './main/io' );

// check for updates
autoUpdater.checkForUpdatesAndNotify();
let mainWindow;
let tray = null;
let isDialog = false;
let deeplinkingUrl;
let gbounds;
// Check if Windows or Mac
const isWinOS = process.platform === 'win32';
const isMacOS = process.platform === 'darwin';

if (isMacOS) {
  darkMode = systemPreferences.isDarkMode();
} else if (isWinOS) {
  darkMode = systemPreferences.isInvertedColorScheme();
}


// Force Single Instance Application
const gotTheLock = app.requestSingleInstanceLock()
if (gotTheLock) {
  app.on('second-instance', (e, argv) => {
    // Someone tried to run a second instance, we should focus our window.

    // Protocol handler for win32
    // argv: An array of the second instance’s (command line / deep linked) arguments
    if (process.platform == 'win32') {
      // Keep only command line / deep linked arguments
      deeplinkingUrl = argv.slice(1)
    }
    //logEverywhere('app.makeSingleInstance# ' + deeplinkingUrl)

    if (mainWindow) {
		let positioner = new Positioner(mainWindow);
		if (gbounds != null){
		positioner.move('trayBottomCenter', gbounds);	
		}
        
        mainWindow.show();

    }
  })
} else {
  app.quit()
  return
}



// open a window
const openWindow = () => {
    const win = new BrowserWindow( {
        width: 800,
        height: 500,
        webPreferences: {
            nodeIntegration: true,
        },
		title: 'PocketCloud',
		show: false,
		//fullscreenable: false,
		//maximizable: false,
		//minimizable: false,
		//transparent: true,
		//frame: false,
       // resizable: false,
		// movable: false,
		//autoHideMenuBar: true,
        //center: true,
       // thickFrame: true,
		//backgroundColor: darkMode ? '#1f1f1f' : '#ffffff',
    } );
	win.setSkipTaskbar(true);

	// Protocol handler for win32
	  if (process.platform == 'win32') {
		// Keep only command line / deep linked arguments
		deeplinkingUrl = process.argv.slice(1)
	  }
    // load `index.html` file
    win.loadFile( path.resolve( __dirname, 'render/html/index.html' ) );


    /*-----*/
	
	tray = createTray();
	
    win.on('minimize', function (event) {
        event.preventDefault();
        win.hide();
        
    });

    win.on('restore', function (event) {
        win.show();
        //tray.destroy();
    });
	
    return win; // return window
};

function createTray() {
    let appIcon = new Tray(path.join(__dirname, './resources/paper.png'));
	
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show', click: function () {
                mainWindow.show();
            }
        },
        {
            label: 'Exit', click: function () {
                app.isQuiting = true;
                app.quit();
            }
        }
    ]);

    appIcon.on('double-click', function (event) {
        mainWindow.show();
    });
	appIcon.on('click', (e, bounds) => {
		gbounds = bounds;
      if ( mainWindow.isVisible() ) {
        mainWindow.hide();
      } else {
        let positioner = new Positioner(mainWindow);
        positioner.move('trayBottomCenter', bounds)

        mainWindow.show();
      }
	  });
    appIcon.setToolTip('Tray Tutorial');
    appIcon.setContextMenu(contextMenu);
    return appIcon;
}



if (!app.isDefaultProtocolClient('pocketcloud')) {
  // Define custom protocol handler. Deep linking works on packaged versions of the application!
  app.setAsDefaultProtocolClient('pocketcloud');
}

// Protocol handler for osx
app.on('open-url', function (event, url) {
  event.preventDefault()
  deeplinkingUrl = url
 // logEverywhere("open-url# " + deeplinkingUrl)
});


// when app is ready, open a window
app.on( 'ready', () => {
    mainWindow = openWindow();

    // watch files
    io.watchFiles( mainWindow );
} );

// when all windows are closed, quit the app
app.on( 'window-all-closed', () => {
// On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
    if( process.platform !== 'darwin' ) {
        app.quit();
    }
} );

// when app activates, open a window
app.on( 'activate', () => {
    if( BrowserWindow.getAllWindows().length === 0 ) {
        mainWindow = openWindow();
    }
} );

app.on('browser-window-focus', () => {
    if (mainWindow) {
        console.log('browser-window-focus');

       
    }
});

app.on('browser-window-blur', () => {
    console.log('browser-window-blur');
    if (mainWindow) {
		if (!isDialog){
		mainWindow.hide();	
		}
        isDialog = false;
    }
});
/************************/

// return list of files
ipcMain.handle( 'app:get-files', () => {
    return io.getFiles();
} );

// listen to file(s) add event
ipcMain.handle( 'app:on-file-add', ( event, files = [] ) => {
    io.addFiles( files );
} );

// open filesystem dialog to choose files
ipcMain.handle( 'app:on-fs-dialog-open', async ( event ) => {
	console.log('Ipc answered, calling dialog');
	isDialog = true;
    await dialog.showOpenDialogSync( mainWindow,{
        properties: [ 'openFile', 'multiSelections' ],
    } ).then((fileNames)=>{
           if (fileNames === undefined) {
             console.log("No file selected");
           } else {
             console.log('file:', fileNames[0]);
             replyField.value = fileNames[0];
			 io.addFiles( files.map( filepath => {
        return {
            name: path.parse( filepath ).base,
            path: filepath,
        };
    } ) );
           }
     }).catch(err=>console.log('Handle Error',err))

    
} );

/*-----*/

// listen to file delete event
ipcMain.on( 'app:on-file-delete', ( event, file ) => {
    io.deleteFile( file.filepath );
} );

// listen to file open event
ipcMain.on( 'app:on-file-open', ( event, file ) => {
    io.openFile( file.filepath );
} );

// listen to file copy event
ipcMain.on( 'app:on-file-copy', ( event, file ) => {
    event.sender.startDrag( {
        file: file.filepath,
        icon: path.resolve( __dirname, './resources/paper.png' ),
    } );
} );

let worker;
if (isMainThread) {
    worker = new Worker(__dirname + '/worker.js');
    
    worker.on('message', (data) => {
      // 'data' contains the parsed JSON sent by worker thread
      // Do something with data
    });
    
    worker.on('error', (error) => {
      // Logging error caused by worker thread
      console.log(error.message);
    });
    
    worker.on('exit', (code) => {
        if (code !== 0){
            console.error(`worker exited with code ${code}`);
			//spawn(); //https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/threads.md
		}else
            logger.info('Worker stopped ' + code);
    });
}

//getChecksum('someFile.txt')
//.then(checksum => console.log(`checksum is ${checksum}`))
//.catch(err => console.log(err));
const crypto = require('crypto');
function getChecksum(path) {
    return new Promise((resolve, reject) => {
      // if absolutely necessary, use md5
      const hash = crypto.createHash('sha256');
      const input = fs.createReadStream(path);
      input.on('error', reject);
      input.on('data', (chunk) => {
          hash.update(chunk);
      });
      input.on('close', () => {
          resolve(hash.digest('hex'));
      });
    });
}