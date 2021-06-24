const { app, BrowserWindow, ipcMain, systemPreferences, dialog, Tray, Menu } = require('electron');
const path = require('path');
const os = require('os');
const EventEmitter = require('events');
const { autoUpdater } = require('electron-updater');
const Positioner = require('electron-positioner');//electron-traywindow-positioner talvez seja melhor
const fork = require('child_process').fork;
// local dependencies
const io = require('./main/io');
const https = require('https')
const querystring = require('querystring')
const {
    ID_RENDERER,
    CHAN_RENDERER_TO_WORKER,
    CHAN_WORKER_TO_RENDERER,
    CHAN_WORKER_ERROR,
    TYPE_ERROR,
} = require('./types.js')

function sendMessageFor(token, channel) {
    const baseUrl = `https://api.telegram.org/bot${token}`

    return message => {
        const urlParams = querystring.stringify({
            chat_id: channel,
            text: message,
            parse_mode: 'HTML'
        })

        return sendRequestSync(`${baseUrl}/sendMessage?${urlParams}`)
    }
}

function sendRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, res => res.statusCode === 200 ? resolve(res) : reject(res))
            .on('error', reject)
    })
}
function sendRequestSync(url) {
    https.get(url, res => res.statusCode === 200)
}

function sendMsg(message) {
    const sendMessage = sendMessageFor('1621388212:AAHVIiVUPKYzNidK5PdvMAQdRfDhaNATLwo', '@startuphbase')
    sendMessage(message)
}
//https://app.glitchtip.com/mycompany/issues
//const sentry  = require('@sentry/electron');
//sentry.init({ dsn: "https://65a79bdaeaae4445bf6cc880618baa2d@app.glitchtip.com/343" });

// One-liner for current directory
var fs = require('fs');

const winston = require('winston');
// Check if Windows or Mac
const isWinOS = process.platform === 'win32';
const isMacOS = process.platform === 'darwin';
const isDev = require('electron-is-dev');

//Todo: fazer crash report online https://www.thorsten-hans.com/electron-crashreporter-stay-up-to-date-if-your-app-fucked-up/


/*
const child  = spawn(process.execPath, [path.join(__dirname, 'child.js'), 'args'], {
   // stdio: 'pipe'
});

child.on('data', function(data) {
    console.log('Received data...');
    console.log(data.toString('utf8'));
});
child.on('message', function(message) {
    console.log('Received message...');
    console.log(message);
});
child.on('close', function(code) {
    console.log('Child process closed');
});
child.on('disconnect', function(code) {
    console.log('Child process disconnected');
    callback();
});
child.on('exit', function(code) {
    console.log('Child exited with code ' + code);
    callback();
});
child.stderr.pipe(process.stderr, { end:true });
child.stdout.pipe(process.stdout, { end:true });
*/


if (isWinOS) {
    const homedir = require('os').homedir();
    const appData = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
    syncDir = homedir + '\\PocketCloud\\';
    dbDir = appData + '\\app\\misc';
    dbFile = dbDir + '\\misc.data'
    dbExists = fs.existsSync(dbFile);
    workerPath = isDev ? 'app\\child.js' : 'app.asar\\app\\child.js';
} else if (isMacOS) {
    const homedir = require('os').homedir();
    const appData = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
    syncDir = homedir + '/PocketCloud/';
    dbDir = appData + '/app/misc';
    dbFile = dbDir + '/misc.data'
    dbExists = fs.existsSync(dbFile);
    workerPath = isDev ? 'app/child.js' : 'app.asar/app/child.js';
}


workerCwd =
    isDev ? undefined : path.join(__dirname, '..');
if (workerCwd != undefined && workerCwd.includes('app.asar')) {
    sendMsg('TIVE QUE REMOVER MAIS UM' + workerCwd);
    workerCwd = path.join(workerCwd, '..')
}
sendMsg('__dirname ' + __dirname);
sendMsg('workerPath ' + workerPath);
sendMsg('workerCwd ' + workerCwd);
const worker = fork(workerPath, [], {
    cwd: workerCwd
    //cwd: workerCwd, stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    //cwd: workerCwd, 
});
/*
p.stdout.on('data', (d) => {
    console.log('data', '[stdout-main-fork] ' + d.toString());
});
p.stderr.on('data', (d) => {
    console.log('data', '[stderr-main-fork] ' + d.toString());
});
*/
worker.on('message', (msg) => {
    const { dst, type } = msg;
    if (dst === ID_RENDERER) {
        if (mainWindow === null) {
            return;
        }
        switch (type) {
            case TYPE_ERROR: {
                const { error } = msg;
                sendMsg('TYPE_ERROR ' + msg);
                //mainWindow.webContents.send(CHAN_WORKER_ERROR, error);
                break;
            }
            default: {
                //mainWindow.webContents.send(CHAN_WORKER_TO_RENDERER, msg);
                sendMsg('TYPE_ERROR ' + error);
                break;
            }
        }
    }
});

ipcMain.on(CHAN_RENDERER_TO_WORKER, (_event, msg) => {
    worker.send(msg);
});

worker.on('exit', function (code) {
    if (code == 1) {
        console.log('Child exited with code ' + code);
        sendMsg('Child exited with code ' + code);
    } else {
        console.log('Child exited with code ' + code);
        sendMsg('Child exited with code ' + code);
    }
    // callback();
});
worker.on('error', (error) => {
    console.log('Child exited with error ' + error);
    sendMsg('Child exited with error ' + error);
})


if (isDev) {

} else {
    console.log('Running in production');
}




//ATENCAO - Esta funcao esta sendo executada apos 30 segundos da inicialização do aplicativo. 
//Vai ficar de butuca pra hashear todos os arquivos de novo, de forma lenta. 
//Chokidar vai listar todos os arquivos na pasta, antes de começar a monitorar. 
//Esta lista de arquivos vai ser salva em um array? acho que eu posso usar o banco.. 
//verifico se ja esta cadastrado no banco e se o tamanho bate. 
//se nao bater, espero 30 segundos e faço hash?
//se bater, vai pro hash lento 
//acho que o jeito eh hashear pedaços, igual eu fiz no python. 
//faço hash só pra arquivo grande que eu faço hash parcial.. vou pensar isto agora, mas nao vou implementar tudo. 
//

//o ponto de atençao são os arquivos que mudaram o tamanho. 
//se mudou o tamanho, dae eu vou fazer hash prioritario. 



// check for updates
autoUpdater.checkForUpdatesAndNotify();
let mainWindow;
let tray = null;
let isDialog = false;
let deeplinkingUrl;
let gbounds;

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
        skipTaskbar: true,
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
    //win.setSkipTaskbar(true);

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
    let appIcon = new Tray(path.join(__dirname, './resources/icon.png'));

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
    appIcon.setToolTip('Pocket.Cloud');
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

const osInfo = require("@felipebutcher/node-os-info");

setInterval(() => {
    var idleSeconds;
    var uptime = os.uptime();
    //se o uptime for menor que 50 segundos, 
    //dae eu vou esperar... senao não... 

    //vou largar assim.. chokidar watch chama... 
    //depois do sync, ele vai setar o ready...
    //dae ele vai chamar depois de 3 segundos..
    //aí ele vai remover os arquivos deletados (preciso criar este teste)
    //depois ele vai hashear os arquivos delayed. 
    if (uptime < 50) {

    } else {
        //
    }
    if (idleSeconds >= 20) {

    } else {
        osInfo.cpu(cpu => {
            var load = Math.round(cpu * 100);

            if (load < 20) {
                idleSeconds += 1;
            }

        });

    }
    //console.log("Uptime: " + uptime);

}, 3000);

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
    db.close();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

process.on("SIGINT", function () {
    console.log('Sigint')
    worker.kill('SIGINT')
    process.exit(0)

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


