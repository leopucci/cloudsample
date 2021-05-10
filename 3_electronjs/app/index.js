const { app, BrowserWindow, ipcMain, dialog,Tray ,Menu} = require( 'electron' );
const path = require( 'path' );
const { autoUpdater } = require( 'electron-updater' );

// local dependencies
const io = require( './main/io' );

// check for updates
autoUpdater.checkForUpdatesAndNotify();
let mainWindow;
let tray = null;
let isDialog = false;
// open a window
const openWindow = () => {
    const win = new BrowserWindow( {
        width: 800,
        height: 500,
        webPreferences: {
            nodeIntegration: true,
        },
		transparent: true,
        resizable: false,
		//autoHideMenuBar: true,
        //center: true,
        thickFrame: true,
    } );

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
    appIcon.setToolTip('Tray Tutorial');
    appIcon.setContextMenu(contextMenu);
    return appIcon;
}


// when app is ready, open a window
app.on( 'ready', () => {
    mainWindow = openWindow();

    // watch files
    io.watchFiles( mainWindow );
} );

// when all windows are closed, quit the app
app.on( 'window-all-closed', () => {
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
ipcMain.handle( 'app:on-fs-dialog-open', ( event ) => {
	isDialog = true;
    const files = dialog.showOpenDialogSync( {
        properties: [ 'openFile', 'multiSelections' ],
    } );

    io.addFiles( files.map( filepath => {
        return {
            name: path.parse( filepath ).base,
            path: filepath,
        };
    } ) );
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