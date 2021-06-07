const { app, BrowserWindow, ipcMain, systemPreferences, dialog, Tray, Menu } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const Positioner = require('electron-positioner');//electron-traywindow-positioner talvez seja melhor
const { isMainThread, parentPort, Worker } = require('worker_threads');
// local dependencies
const io = require('./main/io');
const chokidar = require('chokidar');
const sqlite3 = require('sqlite3').verbose();
const workerpool = require('workerpool');
// One-liner for current directory
var fs = require('fs');
var dbFile = './database.sqlite';
var dbExists = fs.existsSync(dbFile);
var currentTasks = [];

//####################### MIGRACAO  #################################

if (!dbExists) {
    console.log('banco nao existe');
    fs.openSync(dbFile, 'w');
} else {
    console.log('banco existe');
}

var db = new sqlite3.Database(dbFile);

if (!dbExists) {
    db.run('CREATE TABLE `files` ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, `fileName` TEXT, `path` TEXT, `status` TEXT, `hash` TEXT)');
    db.close();
}


const pool = workerpool.pool(__dirname + '/worker.js', { maxWorkers: 900000, workerType: 'thread', maxQueueSize: 200000 });



function isHashBeingDone(id) {
    return currentTasks.findIndex(task => task.pathId === id);
}
var syncDir = app.getPath('home') + '/PocketCloud/';

console.log("Watching " + syncDir);
const watcher = chokidar.watch(syncDir, {
    awaitWriteFinish: true

})
//.on('all', (event, path) => {
//  console.log('Event: ' + event, path);
//});


//threads..
//eu recebo o evento de arquivo
//aciono a thread de hash.. e o banco? gravo no banco que to hasheando, 
//dae eu recebo o evento de change.. dae eu cancelo a promise e começo de novo. 
//quando terminar, eu salvo no banco o hash e começo o upload. 


watcher
    .on('add', path => {
        //console.log(`File ${path} has been addedAAA`);
        // db.run(`INSERT INTO files(fileName,path,type,) VALUES(?)`, ['C'], function (err) {
        //    if (err) {
        //   return console.log(err.message);
        //   }
        //  });


        startOrRestartHashingThread(syncDir, path);

    });

watcher.on('change', path => {
    startOrRestartHashingThread(syncDir, path);

    console.log(`File ${path} has been changed`)
});
watcher.on('unlink', path => {
    console.log(`File ${path} has been removed`)
});

// More possible events.
watcher.on('addDir', path => {
    console.log(`Directory ${path} has been added`)
});
watcher.on('unlinkDir', path => {
    console.log(`Directory ${path} has been removed2`)
});
watcher.on('error', error => {
    console.log(`Watcher error: ${error}`)
});
watcher.on('ready', () => {
    //Aqui eu tenho que re-escanear o diretorio todo, e bater com o banco.
    console.log('Initial scan complete. Ready for changes')
});
//watcher.on('raw', (event, path, details) => { // internal
//  console.log('Raw event info:', event, path, details);
//});

function startOrRestartHashingThread(syncDir, path) {

    pathId = path.split(syncDir);
    if (isHashBeingDone(pathId) != -1) {
        cancelTaskInProcess(pathId);
    }

    console.log(
        `HASH SERVICE: CREATING NEW Hasher for ${path} `
    );

    //process.exit(1);
    // Initialise a training thread
    // pool.exec returns a promise we will resolve later
    // in currentTasksHandler()

    // create a new task for the queue containing the id and the promise
    const task = {
        fullPath: path,
        pathId: pathId,
        promise: pool.exec('fileHasherThread', [
            { fullPath: path, pathId: pathId, syncDir: syncDir }
        ])
    };
    currentTasks.push(task);

    // Run the promise handler
    currentTasksHandler(pathId);

}
function cancelTaskInProcess(path) {
    let index = isHashBeingDone(path);
    console.log(
        `HASH SERVICE: Hasher for ${path} already running`
    );
    currentTasks[index].promise.cancel(); // cancel promise
    currentTasks.splice(index, 1); // remove from array
    console.log('Hash SERVICE: Cancelled hasher for this ID');
    //console.log(currentTasks);
}
var contador = 0;
function currentTasksHandler(id) {
    //console.log(currentTasks);
    //  const TIMEOUT = 30000;
    currentTasks[currentTasks.length - 1].promise
        // .timeout(TIMEOUT)
        // when the promise is resolved patch the tokens with 'training': 'uptodate',
        // patch the Model with a new updated date, and then write out the training file
        .then(result => {
            switch (result.tipo) {
                case 'COMPLETED_OK':
                    contador = contador + 1;

                    console.log("PROMISE FINALIZADA: tipo: " + result.tipo + " Path: " + result.path + " Tempo: " + result.timeSpent + " segundos Hash: " + result.hash);
                    break;
                case 'ERROR_EBUSY':
                    console.log("PROMISE FINALIZADA: tipo: " + result.tipo + " Tempo: " + result.timeSpent + " segundos Path: " + result.path);
                    break;
                case 'ERROR_UNKNOWN':
                    console.log("PROMISE FINALIZADA: tipo: " + result.tipo + " Tempo: " + result.timeSpent + " segundos Name: " + result.name + " Message: " + result.message);
                    break;

                default:
                    console.log(`Erro mensagem nao reconhecida`);
            }

            console.log(pool.stats());

            // remove finished task from runningTasks queue array
            const index = currentTasks.findIndex(
                task => (task.pathId = id)
            );
            currentTasks.splice(index, 1);
            console.log(
                `HASH SERVICE WORKERPOOL: Hashing finished for ${id}`
            );

            // Logic on successful resolve here
            // result is a json file which is saved to disk

        })
        .catch(err => {
            console.error('HASH SERVICE WORKERPOOL ERROR:', err);
            console.log(pool.stats());
        })
        // WorkerPool seems to terminate its process by itself when all jobs have finished,
        // pool becomes null, so after all training jobs have completed, we have to instantiate pool again
        .then(function () {
            console.log('HASH SERVICE WORKERPOOL: All workers finished.');
            console.log('Contador = ' + contador);
            if (pool == null) {
                pool.terminate();
                pool = workerpool.pool(__dirname + '/worker.js', { maxWorkers: 9, workerType: 'thread', maxQueueSize: 2000 });
            }

        });
}

console.log(app.getPath('home'));
//esta funcao aqui eh meio o que o chokidar ja faz e nao faz direito.. entao nao adianta.. 
function checkFileCopyComplete(path, prev) {
    fs.stat(path, function (err, stat) {

        if (err) {
            throw err;
        }
        if (stat.mtime.getTime() === prev.mtime.getTime()) {
            logger.info(component + 'File copy complete => beginning processing');
            //------------------------------------- 
            // CALL A FUNCTION TO PROCESS FILE HERE
            //-------------------------------------
        }
        else {
            setTimeout(checkFileCopyComplete, fileCopyDelaySeconds * 1000, path, stat);
        }
    });
}

//####################MIGRACAO END ############################


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
            if (gbounds != null) {
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
    const win = new BrowserWindow({
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
    });
    win.setSkipTaskbar(true);

    // Protocol handler for win32
    if (process.platform == 'win32') {
        // Keep only command line / deep linked arguments
        deeplinkingUrl = process.argv.slice(1)
    }
    // load `index.html` file
    win.loadFile(path.resolve(__dirname, 'render/html/index.html'));


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
        if (mainWindow.isVisible()) {
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
app.on('ready', () => {
    mainWindow = openWindow();

    // watch files
    io.watchFiles(mainWindow);
});

// when all windows are closed, quit the app
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// when app activates, open a window
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = openWindow();
    }
});

app.on('browser-window-focus', () => {
    if (mainWindow) {
        console.log('browser-window-focus');


    }
});

app.on('browser-window-blur', () => {
    console.log('browser-window-blur');
    if (mainWindow) {
        if (!isDialog) {
            mainWindow.hide();
        }
        isDialog = false;
    }
});
/************************/

// return list of files
ipcMain.handle('app:get-files', () => {
    return io.getFiles();
});

// listen to file(s) add event
ipcMain.handle('app:on-file-add', (event, files = []) => {
    io.addFiles(files);
});

// open filesystem dialog to choose files
ipcMain.handle('app:on-fs-dialog-open', async (event) => {
    console.log('Ipc answered, calling dialog');
    isDialog = true;
    await dialog.showOpenDialogSync(mainWindow, {
        properties: ['openFile', 'multiSelections'],
    }).then((fileNames) => {
        if (fileNames === undefined) {
            console.log("No file selected");
        } else {
            console.log('file:', fileNames[0]);
            replyField.value = fileNames[0];
            io.addFiles(files.map(filepath => {
                return {
                    name: path.parse(filepath).base,
                    path: filepath,
                };
            }));
        }
    }).catch(err => console.log('Handle Error', err))


});

/*-----*/

// listen to file delete event
ipcMain.on('app:on-file-delete', (event, file) => {
    io.deleteFile(file.filepath);
});

// listen to file open event
ipcMain.on('app:on-file-open', (event, file) => {
    io.openFile(file.filepath);
});

// listen to file copy event
ipcMain.on('app:on-file-copy', (event, file) => {
    event.sender.startDrag({
        file: file.filepath,
        icon: path.resolve(__dirname, './resources/paper.png'),
    });
});

let worker;
if (isMainThread) {
    worker = new Worker(__dirname + '/workerthread.js');

    worker.on('message', (data) => {
        // 'data' contains the parsed JSON sent by worker thread
        // Do something with data
    });

    worker.on('error', (error) => {
        // Logging error caused by worker thread
        console.log(error.message);
    });

    worker.on('exit', (code) => {
        if (code !== 0) {
            console.error(`worker exited with code ${code}`);
            //spawn(); //https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/threads.md
        } else
            logger.info('Worker stopped ' + code);
    });
}

