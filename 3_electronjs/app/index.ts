// @ts-expect-error ts-migrate(6200) FIXME: Definitions of the following identifiers conflict ... Remove this comment to see the full error message
const {
  app,
  BrowserWindow,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'ipcMain'.
  ipcMain,
  systemPreferences,
  dialog,
  Tray,
  Menu,
} = require("electron");
const osInfo = require("@felipebutcher/node-os-info");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require("path");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'os'.
const os = require("os");
const homedir = require("os").homedir();
const { autoUpdater } = require("electron-updater");
const Positioner = require("electron-positioner"); // electron-traywindow-positioner talvez seja melhor
// eslint-disable-next-line security/detect-child-process
const { fork } = require("child_process");
const fs = require("fs");
// local dependencies
const https = require("https");
const querystring = require("querystring");

let appReadyEvent = false;
let appLoginMode = false;
/*
function sendRequestSync(url: any) {
  https.get(url, (res: any) => res.statusCode === 200);
}
function sendMessageFor(token: any, channel: any) {
  const baseUrl = `https://api.telegram.org/bot${token}`;

  return (message: any) => {
    const urlParams = querystring.stringify({
      chat_id: channel,
      text: message,
      parse_mode: "HTML",
    });

    return sendRequestSync(`${baseUrl}/sendMessage?${urlParams}`);
  };
}

function sendMsg(message: any) {
  const sendMessage = sendMessageFor(
    "1621388212:AAHVIiVUPKYzNidK5PdvMAQdRfDhaNATLwo",
    "@startuphbase"
  );
  sendMessage(message);
}
*/
// https://app.glitchtip.com/mycompany/issues
// const sentry  = require('@sentry/electron');
// sentry.init({ dsn: "https://65a79bdaeaae4445bf6cc880618baa2d@app.glitchtip.com/343" });

// One-liner for current directory

// Check if Windows or Mac
const isWinOS = process.platform === "win32";
const isMacOS = process.platform === "darwin";
const isDev = require("electron-is-dev");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'mainLogger... Remove this comment to see the full error message
const { mainLogger } = require("./logger");
const io = require("./main/io");

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
let syncDir;
let dbDir;
let dbFile;
let dbExists;
let workerPath;

if (isWinOS) {
  const appData =
    process.env.APPDATA ||
    (process.platform === "darwin"
      ? `${process.env.HOME}/Library/Preferences`
      : `${process.env.HOME}/.local/share`);
  syncDir = `${homedir}\\Pocket.Cloud\\`;
  dbDir = `${appData}\\Pocket.Cloud\\dist\\misc`;
  dbFile = `${dbDir}\\misc.data`;
  dbExists = fs.existsSync(dbFile);
  workerPath = isDev ? "dist\\child.js" : "app.asar\\dist\\child.js";
} else if (isMacOS) {
  const appData =
    process.env.APPDATA ||
    (process.platform === "darwin"
      ? `${process.env.HOME}/Library/Preferences`
      : `${process.env.HOME}/.local/share`);
  syncDir = `${homedir}/Pocket.Cloud/`;
  dbDir = `${appData}/Pocket.Cloud/app/misc`;
  dbFile = `${dbDir}/misc.data`;
  dbExists = fs.existsSync(dbFile);
  workerPath = isDev ? "app/child.js" : "app.asar/app/child.js";
}

let workerCwd = isDev ? undefined : path.join(__dirname, "..");
if (workerCwd !== undefined && workerCwd.includes("app.asar")) {
  // sendMsg(`TIVE QUE REMOVER MAIS UM${workerCwd}`);
  workerCwd = path.join(workerCwd, "..");
}

mainLogger.info(`__dirname ${__dirname}`);
mainLogger.info(`workerPath ${workerPath}`);
mainLogger.info(`workerCwd ${workerCwd}`);
const worker = fork(workerPath, [], {
  cwd: workerCwd,
  // cwd: workerCwd, stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
  // cwd: workerCwd,
});
/*
p.stdout.on('data', (d) => {
    console.log('data', '[stdout-main-fork] ' + d.toString());
});
p.stderr.on('data', (d) => {
    console.log('data', '[stderr-main-fork] ' + d.toString());
});
*/
worker.on("message", (message: any) => {
  mainLogger.info("RECEBIDA MENSAGEM DA WORKER ", message);
  const { src, dst, type, msg } = message;
  if (dst === "ID_RENDERER") {
    if (mainWindow === null) {
      return;
    }
    switch (type) {
      case "TYPE_ERROR": {
        mainLogger.info("CAIU NO TYPE_ERROR");
        const { error } = msg;
        // sendMsg(`TYPE_ERROR ${msg}`);
        // mainWindow.webContents.send(CHAN_WORKER_ERROR, error);
        break;
      }
      case "TYPE_STARTUP_SHOW_LOGIN_WINDOW": {
        mainLogger.info(
          "Recebi evento pra chamar tela de login da thread do banco. "
        );
        mainWindow = startup_login_window();
        // mainWindow.webContents.send(CHAN_WORKER_ERROR, error);
        break;
      }
      case "TYPE_STARTUP_SHOW_LOGGED_IN_WINDOW": {
        mainLogger.info(
          "Recebi evento pra chamar codigo logado da thread do banco. "
        );
        // mainWindow.webContents.send(CHAN_WORKER_ERROR, error);
        break;
      }
      default: {
        mainLogger.info("CAIU NO DEFAULT");
        // mainWindow.webContents.send(CHAN_WORKER_TO_RENDERER, msg);
        // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'error'. Did you mean 'Error'?
        sendMsg(`TYPE_ERROR ${error}`);
        break;
      }
    }
  }
});

ipcMain.on("CHAN_RENDERER_TO_WORKER", (_event: any, msg: any) => {
  worker.send(msg);
});

worker.on("exit", function (code: any) {
  if (code === 1) {
    mainLogger.info(`Child exited with code ${code}`);
    // sendMsg(`Child exited with code ${code}`);
  } else {
    mainLogger.info(`Child exited with code ${code}`);
    // sendMsg(`Child exited with code ${code}`);
  }
  // callback();
});
worker.on("error", (error: any) => {
  mainLogger.info(`Child exited with error ${error}`);
  // sendMsg(`Child exited with error ${error}`);
});

if (isDev) {
} else {
  mainLogger.info("Running in production");
}

// ATENCAO - Esta funcao esta sendo executada apos 30 segundos da inicialização do aplicativo.
// Vai ficar de butuca pra hashear todos os arquivos de novo, de forma lenta.
// Chokidar vai listar todos os arquivos na pasta, antes de começar a monitorar.
// Esta lista de arquivos vai ser salva em um array? acho que eu posso usar o banco..
// verifico se ja esta cadastrado no banco e se o tamanho bate.
// se nao bater, espero 30 segundos e faço hash?
// se bater, vai pro hash lento
// acho que o jeito eh hashear pedaços, igual eu fiz no python.
// faço hash só pra arquivo grande que eu faço hash parcial.. vou pensar isto agora, mas nao vou implementar tudo.
//

// o ponto de atençao são os arquivos que mudaram o tamanho.
// se mudou o tamanho, dae eu vou fazer hash prioritario.

// check for updates
autoUpdater.checkForUpdatesAndNotify();
let mainWindow: any;
let tray = null;
let isDialog = false;
let deeplinkingUrl;
let gbounds: any;

let darkMode;
if (isMacOS) {
  darkMode = systemPreferences.isDarkMode();
} else if (isWinOS) {
  darkMode = systemPreferences.isInvertedColorScheme();
}

// Force Single Instance Application
const gotTheLock = app.requestSingleInstanceLock();
if (gotTheLock) {
  app.on("second-instance", (e: any, argv: any) => {
    // Someone tried to run a second instance, we should focus our window.

    // Protocol handler for win32
    // argv: An array of the second instance’s (command line / deep linked) arguments
    if (process.platform === "win32") {
      // Keep only command line / deep linked arguments
      deeplinkingUrl = argv.slice(1);
    }
    // logEverywhere('app.makeSingleInstance# ' + deeplinkingUrl)

    if (mainWindow) {
      const positioner = new Positioner(mainWindow);
      if (gbounds != null) {
        positioner.move("trayBottomCenter", gbounds);
      }

      mainWindow.show();
    }
  });
} else {
  app.quit();
  // return
}

function startup_login_window() {
  // https://bbbootstrap.com/snippets/login-form-footer-and-social-media-icons-55203607
  while (appReadyEvent === false) {
    sleep(1);
    mainLogger.info("aguardando o app estar ready pra montar janela. ");
  }
  appLoginMode = true;

  const win = new BrowserWindow({
    width: 1100,
    height: 635,
    webPreferences: {
      nodeIntegration: true,
    },
    title: "Pocket.Cloud",
    show: true,
    skipTaskbar: false,
    // fullscreenable: false,
    // maximizable: false,
    // minimizable: false,
    // transparent: true,
    // frame: false,
    // resizable: false,
    // movable: false,
    autoHideMenuBar: true,
    center: true,
    // thickFrame: true,
    // backgroundColor: darkMode ? '#1f1f1f' : '#ffffff',
  });
  // win.setSkipTaskbar(true);

  // Protocol handler for win32
  if (process.platform === "win32") {
    // Keep only command line / deep linked arguments
    deeplinkingUrl = process.argv.slice(1);
  }
  // load `index.html` file
  win.loadFile(path.resolve(__dirname, "render/html/login.html"));
  win.webContents.setWindowOpenHandler(({
    url
  }: any) => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shell'.
    shell.openExternal(url);
    return { action: "deny" };
  });

  /*-----*/

  tray = createTray();

  win.on("minimize", function (event: any) {
    // event.preventDefault();
    // win.hide();
  });

  win.on("restore", function (event: any) {
    win.show();
    // tray.destroy();
  });

  return win; // return window
}

// open a window
const openWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 500,
    icon: `${__dirname}resources/icon.png`,
    webPreferences: {
      nodeIntegration: true,
    },
    title: "PocketCloud",
    show: false,
    skipTaskbar: true,
    // fullscreenable: false,
    // maximizable: false,
    // minimizable: false,
    // transparent: true,
    // frame: false,
    // resizable: false,
    // movable: false,
    // autoHideMenuBar: true,
    // center: true,
    // thickFrame: true,
    // backgroundColor: darkMode ? '#1f1f1f' : '#ffffff',
  });
  // win.setSkipTaskbar(true);

  // Protocol handler for win32
  if (process.platform === "win32") {
    // Keep only command line / deep linked arguments
    deeplinkingUrl = process.argv.slice(1);
  }
  // load `index.html` file
  win.loadFile(path.resolve(__dirname, "render/html/index.html"));

  /*-----*/

  tray = createTray();

  win.on("minimize", function (event: any) {
    event.preventDefault();
    win.hide();
  });

  win.on("restore", function (event: any) {
    win.show();
    // tray.destroy();
  });

  return win; // return window
};

function createTray() {
  const appIcon = new Tray(path.join(__dirname, "./resources/icon.png"));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show",
      click() {
        mainWindow.show();
      },
    },
    {
      label: "Exit",
      click() {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);

  appIcon.on("double-click", function (event: any) {
    mainWindow.show();
  });
  appIcon.on("click", (e: any, bounds: any) => {
    gbounds = bounds;
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      const positioner = new Positioner(mainWindow);
      positioner.move("trayBottomCenter", bounds);

      mainWindow.show();
    }
  });
  appIcon.setToolTip("Pocket.Cloud");
  appIcon.setContextMenu(contextMenu);
  return appIcon;
}

if (!app.isDefaultProtocolClient("pocketcloud")) {
  // Define custom protocol handler. Deep linking works on packaged versions of the application!
  app.setAsDefaultProtocolClient("pocketcloud");
}

// Protocol handler for osx
app.on("open-url", function (event: any, url: any) {
  event.preventDefault();
  deeplinkingUrl = url;
  // logEverywhere("open-url# " + deeplinkingUrl)
});

setInterval(() => {
  let idleSeconds: any;
  const uptime = os.uptime();
  // se o uptime for menor que 50 segundos,
  // dae eu vou esperar... senao não...

  // vou largar assim.. chokidar watch chama...
  // depois do sync, ele vai setar o ready...
  // dae ele vai chamar depois de 3 segundos..
  // aí ele vai remover os arquivos deletados (preciso criar este teste)
  // depois ele vai hashear os arquivos delayed.
  if (uptime < 50) {
  } else {
    //
  }
  if (idleSeconds >= 20) {
  } else {
    osInfo.cpu((cpu: any) => {
      const load = Math.round(cpu * 100);

      if (load < 20) {
        idleSeconds += 1;
      }
    });
  }
  // console.log("Uptime: " + uptime);
}, 3000);

// when app is ready, open a window
app.on("ready", () => {
  appReadyEvent = true;
  // mainWindow = openWindow();

  // watch files
  // io.watchFiles(mainWindow);
});

// when all windows are closed, quit the app
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

process.on("SIGINT", function () {
  mainLogger.info("Sigint");
  worker.kill("SIGINT");
  process.exit(0);
});

// when app activates, open a window
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = openWindow();
  }
});

app.on("browser-window-focus", () => {
  if (mainWindow) {
    mainLogger.info("browser-window-focus");
  }
});

app.on("browser-window-blur", () => {
  mainLogger.info("browser-window-blur");
  if (mainWindow) {
    if (!isDialog && !appLoginMode) {
      mainWindow.hide();
    }
    isDialog = false;
  }
});
/** ********************* */

// return list of files
ipcMain.handle("app:get-files", () => {
  return io.getFiles();
});

// listen to file(s) add event
ipcMain.handle("app:on-file-add", (event: any, files = []) => {
  io.addFiles(files);
});

// open filesystem dialog to choose files
ipcMain.handle("app:on-fs-dialog-open", async (event: any) => {
  mainLogger.info("Ipc answered, calling dialog");
  isDialog = true;
  await dialog
    .showOpenDialogSync(mainWindow, {
      properties: ["openFile", "multiSelections"],
    })
    .then((fileNames: any) => {
      if (fileNames === undefined) {
        mainLogger.info("No file selected");
      } else {
        mainLogger.info("file:", fileNames[0]);
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'replyField'.
        replyField.value = fileNames[0];
        io.addFiles(
          // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'files'. Did you mean 'File'?
          files.map((filepath: any) => {
            return {
              name: path.parse(filepath).base,
              path: filepath,
            };
          })
        );
      }
    })
    .catch((err: any) => mainLogger.info("Handle Error", err));
});

/*-----*/

// listen to file delete event
ipcMain.on("app:on-file-delete", (event: any, file: any) => {
  io.deleteFile(file.filepath);
});

// listen to file open event
ipcMain.on("app:on-file-open", (event: any, file: any) => {
  io.openFile(file.filepath);
});

// listen to file copy event
ipcMain.on("app:on-file-copy", (event: any, file: any) => {
  event.sender.startDrag({
    file: file.filepath,
    icon: path.resolve(__dirname, "./resources/paper.png"),
  });
});

function msleep(n: any) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}
function sleep(n: any) {
  msleep(n * 1000);
}
