// @ts-expect-error ts-migrate(6200) FIXME: Definitions of the following identifiers conflict ... Remove this comment to see the full error message
const {
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'childLogge... Remove this comment to see the full error message
  childLogger,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chokidarLo... Remove this comment to see the full error message
  chokidarLogger,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'sqliteLogg... Remove this comment to see the full error message
  sqliteLogger,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'workerPool... Remove this comment to see the full error message
  workerPoolLogger,
} = require("./logger");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chokidar'.
const chokidar = require("chokidar");
const homedir = require("os").homedir();
const Sqlite3 = require("better-sqlite3-sqleet");
const uuidv4 = require("uuid");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'workerpool... Remove this comment to see the full error message
const workerpool = require("workerpool");
const mqtt = require("mqtt");
const https = require("https");
const querystring = require("querystring");
// Check if Windows or Mac
const isWinOS = process.platform === "win32";
const isMacOS = process.platform === "darwin";
const currentTasksForHash: any = [];
const currentTasksForDelete: any = [];
let chokidarInitialScanEnded = false;
const databaseStartupFinished = false;
let loggedIn = false;

const machineIdSync = require("node-machine-id");
const {
  ID_RENDERER,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'CHAN_RENDE... Remove this comment to see the full error message
  CHAN_RENDERER_TO_WORKER,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'CHAN_WORKE... Remove this comment to see the full error message
  CHAN_WORKER_TO_RENDERER,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'CHAN_WORKE... Remove this comment to see the full error message
  CHAN_WORKER_ERROR,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'TYPE_ERROR... Remove this comment to see the full error message
  TYPE_ERROR,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'TYPE_START... Remove this comment to see the full error message
  TYPE_STARTUP_SHOW_LOGIN_WINDOW,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'TYPE_START... Remove this comment to see the full error message
  TYPE_STARTUP_SHOW_LOGGED_IN_WINDOW,
} = require("./types.js");

process.on("message", (msg) => {
  // Aqui tem um formato de comunicação interessante.
  // https://github.com/proj3rd/tool3rd/blob/master/app/worker.ts

  childLogger.info("Got message:", msg);

  // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
  process.send({
    src: "ID_WORKER",
    dst: ID_RENDERER,
    type: TYPE_ERROR,
    msg: "Voltando da child pra main",
  });
});

/*
// @ts-expect-error ts-migrate(2393) FIXME: Duplicate function implementation.
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

function sendRequest(url: any) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res: any) => res.statusCode === 200 ? resolve(res) : reject(res))
      .on("error", reject);
  });
}
// @ts-expect-error ts-migrate(2393) FIXME: Duplicate function implementation.
function sendRequestSync(url: any) {
  https.get(url, (res: any) => res.statusCode === 200);
}

// @ts-expect-error ts-migrate(2393) FIXME: Duplicate function implementation.
function sendMsg(message: any) {
  const sendMessage = sendMessageFor(
    "1621388212:AAHVIiVUPKYzNidK5PdvMAQdRfDhaNATLwo",
    "@startuphbase"
  );
  sendMessage(message);
}
*/
childLogger.info(`CHILD ExecPath ${process.execPath}`);
childLogger.info(`CHILD argv ${process.argv}`);
childLogger.info(`CHILD cwd ${process.cwd()}`);
childLogger.info("CHILD -- INICIANDO...");

let syncDir: any;
let dbDir;
let dbFile;
let dbExists;

if (isWinOS) {
  const appData =
    process.env.APPDATA ||
    (process.platform === "darwin"
      ? `${process.env.HOME}/Library/Preferences`
      : `${process.env.HOME}/.local/share`);
  syncDir = `${homedir}\\PocketCloud\\`;
  dbDir = `${appData}\\Pocket.Cloud\\app\\misc`;
  dbFile = `${dbDir}\\misc.data`;
  dbExists = fs.existsSync(dbFile);
  childLogger.info(`HOME DIR ${homedir}`);
  childLogger.info(`appData ${appData}`);
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
  childLogger.info(`HOME DIR ${homedir}`);
  childLogger.info(`appData ${appData}`);
}

if (!dbExists) {
  sqliteLogger.info("banco nao existe");
  fs.mkdirSync(dbDir, { recursive: true });
} else {
  sqliteLogger.info(`banco existe: ${dbFile}`);
}

const db = new Sqlite3(dbFile, { verbose: console.log }); // fileName,internalDir,Status,FullFileHash,Status

if (!dbExists) {
  // Esta funcao vai inicializar tudo.
  // Criar pasta tambem se nao existir
  // Mandar uma mensagem pro servidor dizendo que é o primeiro download e baixar toda a listagem de arquivos que tem lá.
  // A partir dai baixar todos.
  db.exec(
    "CREATE TABLE `instalation` ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,  `instalationId` TEXT, `machineId` TEXT )"
  );
  db.exec(
    "CREATE TABLE `userLogin` ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,  `userId` TEXT, `accessToken` TEXT,`refreshToken` TEXT  )"
  );
  const stmt = db.prepare(
    `INSERT INTO instalation(instalationId,machineId) VALUES(?,?)`
  );
  const machineId = machineIdSync.machineIdSync({ original: true });
  const info = stmt.run(uuidv4(), machineId);
  db.exec(
    "CREATE TABLE `files` ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,  `internalPath` TEXT, `fileName` TEXT, `internalDir` TEXT, `status` TEXT,`delayedHashTobeDone` INTEGER,`startupFileCount` INTEGER,`size` TEXT, `fullFileHash` TEXT)"
  );
  // numa primeira execução, a idéia é baixar tudo do servidor.
  // entao a pasta vai ser criada e movida caso exista arquivos... na hora da desinstalaçao. só pra garantir que nao havera cagada.
  // entao pro SW eu sempre vou considerar a pasta vazia? pq ele vai criar e rodar. tenho que por o sw pra rodar ao instalar, dae nao tem furo.
}

let resultadoConsulta;
try {
  const stmt = db.prepare("SELECT accessToken FROM userLogin WHERE id  = 1");
  resultadoConsulta = stmt.get();
  if (resultadoConsulta == undefined) {
    loggedIn = false;
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    process.send({
      src: "ID_WORKER",
      dst: "ID_RENDERER",
      type: "TYPE_STARTUP_SHOW_LOGIN_WINDOW",
      msg: "CHAMA A TELA DE LOGIN",
    });
  } else {
    loggedIn = true;
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    process.send({
      src: "ID_WORKER",
      dst: "ID_RENDERER",
      type: "TYPE_STARTUP_SHOW_LOGGED_IN_WINDOW",
      msg: "CONTINUA O STARTUP JÁ LOGADO",
    });
  }
} catch (error) {
  sqliteLogger.error(`Erro: ${error}`);
}

if (!loggedIn) {
} else {
  const HasherPool = workerpool.pool(`${__dirname}/hashpoolworker.js`, {
    maxWorkers: 900000,
    workerType: "thread",
    maxQueueSize: 200000,
  });
  const StartupDeletionPool = workerpool.pool(
    `${__dirname}/startupdeleteworker.js`,
    { maxWorkers: 900000, workerType: "thread", maxQueueSize: 200000 }
  );

  chokidarLogger.info(`Iniciando a monitorar o diretorio ${syncDir}`);
  const watcher = chokidar.watch(syncDir, {
    awaitWriteFinish: true,
  });
  watcher.on("add", (path: any, stats: any) => {
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    process.send(
      "ENTROU NA ADD File ${path} has been added: ` + stats.size + 'bytes'"
    );
    chokidarLogger.info(`File ${path} has been added: ${stats.size}bytes`);
    let fileIndex = "";
    let fileName = "";
    let filePureName = "";
    let filePureType = "";
    let internalPath = "";
    let internalDir = "";
    if (isWinOS) {
      internalPath = path.substr(syncDir.length);
      // @ts-expect-error ts-migrate(2322) FIXME: Type 'number' is not assignable to type 'string'.
      fileIndex = internalPath.lastIndexOf("\\") + 1;
      // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
      internalDir = internalPath.substring(0, fileIndex - 1);
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
      fileName = internalPath.substr(fileIndex);
      filePureName = fileName.split(".")[0];
      filePureType = fileName.split(".")[1];
    } else {
      internalPath = path.substr(syncDir.length);
      fileIndex = path.lastIndexOf("/") + 1;
      // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
      internalDir = internalPath.substring(0, fileIndex - 1);
      fileName = path.substr(fileIndex);
      filePureName = fileName.split(".")[0];
      filePureType = fileName.split(".")[1];
    }

    // File C: \Users\Leo\PocketCloud\Nova pasta\Novo Documento de Texto - Copia.txt has been added 6bytes
    chokidarLogger.info(`File ${path} has been added: ${stats.size}bytes`);
    chokidarLogger.info(`syncDir.length:  ${syncDir.length}`); // syncDir.length  25
    chokidarLogger.info(`fileIndex: ${fileIndex}`); // fileIndex 11
    chokidarLogger.info(`internalPath: ${internalPath}`); // internalPath Nova pasta\Novo Documento de Texto - Copia.txt
    chokidarLogger.info(`internalDir: ${internalDir}`); // internalDir Nova pasta
    chokidarLogger.info(`fileName: ${fileName}`); // fileName Novo Documento de Texto - Copia.txt
    chokidarLogger.info(`filePureName: ${filePureName}`); // filePureName Novo Documento de Texto - Copia
    chokidarLogger.info(`filePureType: ${filePureType}`); // filePureType txt
    const status = "Incluso";
    // 'Hasheado'
    // 'Uploading'
    // 'Sincronizado'
    // eu estou inserindo, mas nao estou verificando.
    // path completo pode ser primary key.
    // se ja existir, e for
    let resultadoConsulta;
    try {
      const stmt = db.prepare(
        "SELECT id, internalPath, fileName,size FROM files WHERE internalPath  = ?"
      );
      resultadoConsulta = stmt.get(internalPath);
    } catch (error) {
      sqliteLogger.error(`Erro: ${error}`);
    }
    if (resultadoConsulta == undefined) {
      sqliteLogger.info(
        `Nao consegui encontrar no banco um internalPath = ${internalPath}`
      );
    }

    // Se ja tiver iniciado o monitoramento da pasta, entao age normalmente.
    if (chokidarInitialScanEnded) {
      chokidarLogger.info(
        "Ja terminou o scan inicial. initialScanEnded = TRUE"
      );
      // se tiver resultado, faz update e faz hash
      if (resultadoConsulta) {
        var info;
        try {
          const stmt = db.prepare(`UPDATE files SET size = ? WHERE id = ?`);
          info = stmt.run(stats.size, resultadoConsulta.id);
          sqliteLogger.info(`Row(s) updated: ${info.changes}`);
        } catch (error) {
          sqliteLogger.error(`Erro: ${error}`);
          return;
        }
      } else {
        var info;
        try {
          info = db
            .prepare(
              `INSERT INTO files(internalPath,fileName,internalDir,status,size) VALUES(?,?,?,?,?)`
            )
            .run(internalPath, fileName, internalDir, status, stats.size);
        } catch (error) {
          sqliteLogger.error(`Erro: ${error}`);
          return;
        }
        sqliteLogger.info(`Row(s) inserted: ${info.changes}`);
      }
      startOrRestartHashingThread(syncDir, path);
    } else {
      // initialScanEnded == false
      chokidarLogger.info("Startup do chokidar... initialScanEnded = FALSE");
      // initialScanEnded == false quando inicia o sistema
      // Todos os chamados que tiverem false, eu tenho que dar delay..
      // vai dar delay por causa da inicialização do sistema.
      // entao eu coloco numa fila, e só vou hashear a fila depois de 30 segundos, quando o
      // sistema ja tiver iniciado.
      if (resultadoConsulta === undefined) {
        chokidarLogger.info(
          "Nao existe a linha do arquivo no banco, adicionando e fazendo hash"
        );
        // Nao existe a linha, insere e faz hash na hora.
        var info;
        try {
          info = db
            .prepare(
              `INSERT INTO files(internalPath,fileName,internalDir,status,size,startupFileCount) VALUES(?,?,?,?,?,?)`
            )
            .run(internalPath, fileName, internalDir, status, stats.size, 1);
        } catch (error) {
          sqliteLogger.error(`Erro: ${error}`);
          return;
        }
        sqliteLogger.info(`Row(s) inserted: ${info.changes}`);
        startOrRestartHashingThread(syncDir, path);
      } else {
        // Existe a linha e o tamanho bate, vai fazer hash com delay. salva no banco a flag.
        if (resultadoConsulta.size == stats.size) {
          chokidarLogger.info(
            "Existe a linha e o tamanho bate, vai fazer hash com delay. salva no banco a flag."
          );
          var info;
          try {
            const stmt = db.prepare(
              `UPDATE files SET delayedHashTobeDone = 1, startupFileCount = 1 WHERE id = ?`
            );
            info = stmt.run(resultadoConsulta.id);
          } catch (error) {
            sqliteLogger.error(`Erro: ${error}`);
            return;
          }
          sqliteLogger.info(`Row(s) updated: ${info.changes}`);
        } else {
          // Existe a linha e o tamanho nao bate, vai fazer update e hash na hora.
          chokidarLogger.info(
            "Existe a linha e o tamanho nao bate, vai fazer hash na hora."
          );
          var info;
          try {
            const stmt = db.prepare(
              `UPDATE files SET size = ?, startupFileCount = 1 WHERE id = ?`
            );
            info = stmt.run(stats.size, resultadoConsulta.id);
          } catch (error) {
            sqliteLogger.error(`Erro: ${error}`);
            return;
          }
          sqliteLogger.info(`Row(s) updated: ${info.changes}`);
          startOrRestartHashingThread(syncDir, path);
        }
      }
    }
  });

  watcher.on("change", (path: any, stats: any) => {
    startOrRestartHashingThread(syncDir, path);

    chokidarLogger.info(`File ${path} has been changed ${stats.size}bytes`);
  });
  watcher.on("unlink", (path: any) => {
    chokidarLogger.info(`File ${path} has been removed `);
  });

  // More possible events.
  watcher.on("addDir", (path: any, stats: any) => {
    chokidarLogger.info(`Directory ${path} has been added ${stats.size}bytes`);
  });
  watcher.on("unlinkDir", (path: any) => {
    chokidarLogger.info(`Directory ${path} has been removed2`);
  });
  watcher.on("error", (error: any) => {
    chokidarLogger.info(`Watcher error: ${error}`);
  });
  watcher.on("ready", () => {
    // Aqui eu tenho que re-escanear o diretorio todo, e bater com o banco.
    chokidarLogger.info("Initial scan complete. Ready for changes");
    chokidarInitialScanEnded = true;
    // Funcao que vai hashear com delay, os arquivos da pasta.
    setTimeout(delayedHashAoIniciar, 5000);
  });
  // watcher.on('raw', (event, path, details) => { // internal
  //  chokidarLogger.info('Raw event info:', event, path, details);
  // });

  // MQTT
  resultadoConsulta = undefined;
  try {
    const stmt = db.prepare(
      "SELECT instalationId, machineId FROM instalation WHERE id  = 1"
    );
    resultadoConsulta = stmt.get();
  } catch (error) {
    sqliteLogger.error(`Erro: ${error}`);
  }
  const client = mqtt.connect("mqtt://10.8.0.1", {
    username: "usuariodeteste",
    password: "leozin10",
    clientId: resultadoConsulta.instalationId + resultadoConsulta.machineId,
  });

  client.on("connect", function () {
    childLogger.info("mqtt connect");
    client.subscribe("canaldeteste", function (err: any) {
      if (!err) {
        // client.publish('presence', 'Hello mqtt')
        childLogger.info("mqtt subscribe");
      } else {
        childLogger.info(err);
      }
    });
  });

  client.on("close", function () {
    childLogger.info("mqtt disconected");
  });

  client.on("offline", function () {
    childLogger.info("mqtt offline");
  });

  client.on("reconnect", function () {
    childLogger.info("mqtt reconnecting started");
  });

  client.on("error", function (error: any) {
    childLogger.info(`mqtt error: ${error}`);
  });

  client.on("message", function (topic: any, message: any) {
    // message is Buffer
    childLogger.info(`MQTT MESSAGE ${message.toString()}`);
    client.end();
  });
}

function delayedHashAoIniciar() {
  // loopar no banco pegando arquivos que nao foram encontrados e testar o acesso no filesystem..
  // nao achou no filesystem, marco deletado no banco e gero evento.
  const resultadoConsulta = undefined;
  try {
    const stmt = db.prepare(
      "SELECT id, internalPath, fileName,size FROM files WHERE startupFileCount = ?"
    );
    for (const arquivo of stmt.iterate()) {
      if (fs.existsSync(path)) {
        // file exists
      }
    }
  } catch (error) {
    sqliteLogger.error(`Erro: ${error}`);
  }
  if (resultadoConsulta == undefined) {
    //         console.log(`Nao consegui encontrar no banco um internalPath = ` + internalPath);
  }

  // funçao que faz hash prioritario,
  // loopa no banco pegando da tabela os arquivos que mudaram de tamanho.
}

function isHashBeingDone(id: any) {
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'task' implicitly has an 'any' type.
  return currentTasksForHash.findIndex((task) => task.pathId === id);
}

function isDeleteBeingDone(id: any) {
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'task' implicitly has an 'any' type.
  return currentTasksForDelete.findIndex((task) => task.pathId === id);
}

function executaHashTaskNaThread(path: any, pathId: any, syncDir: any) {
  const task = {
    fullPath: path,
    pathId,
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'HasherPool'.
    promise: HasherPool.exec("fileHasherThread", [
      { fullPath: path, pathId, syncDir },
    ]),
  };
  currentTasksForHash.push(task);
}

function executaDeleteTaskNaThread(path: any, syncDir: any) {
  const task = {
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'pathId'. Did you mean 'path'?
    pathId,
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'StartupDeletionPool'.
    promise: StartupDeletionPool.exec("fileDeletionThread", [
      // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'pathId'. Did you mean 'path'?
      { db, pathId, syncDir },
    ]),
  };
  currentTasksForDelete.push(task);

  // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'pathId'. Did you mean 'path'?
  currentTasksHandlerOfDeletetaks(pathId);
}
function startOrRestartHashingThread(syncDir: any, path: any) {
  // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'pathId'. Did you mean 'path'?
  pathId = path.split(syncDir)[1];
  // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'pathId'. Did you mean 'path'?
  if (isHashBeingDone(pathId) != -1) {
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'pathId'. Did you mean 'path'?
    cancelHashTaskInProcess(pathId);
  }

  workerPoolLogger.info(`HASH SERVICE: CREATING NEW Hasher for ${path} `);

  // process.exit(1);
  // Initialise a training thread
  // pool.exec returns a promise we will resolve later
  // in currentTasksHandler()

  // create a new task for the queue containing the id and the promise

  // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'pathId'. Did you mean 'path'?
  executaHashTaskNaThread(path, pathId, syncDir);

  // Run the promise handler
  // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'pathId'. Did you mean 'path'?
  currentTasksHandler(pathId);
}

function startOrRestartDeleteThread(syncDir: any, path: any) {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'pathId'.
  pathId = path.split(syncDir)[1];
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'pathId'.
  if (isDeleteBeingDone(pathId) != -1) {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'pathId'.
    cancelDeleteTaskInProcess(pathId);
  }

  workerPoolLogger.info(`DELETE SERVICE: CREATING NEW Hasher for ${path} `);

  // process.exit(1);
  // Initialise a training thread
  // pool.exec returns a promise we will resolve later
  // in currentTasksHandler()

  // create a new task for the queue containing the id and the promise
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'pathId'.
  pathId = "StartupDelete";
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'pathId'.
  executaDeleteTaskNaThread(path, pathId, syncDir);

  // Run the promise handler
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'pathId'.
  currentTasksHandlerOfDeletetaks(pathId);
}

function cancelHashTaskInProcess(path: any) {
  const index = isHashBeingDone(path);
  workerPoolLogger.info(`HASH SERVICE: Hasher for ${path} already running`);
  currentTasksForHash[index].promise.cancel(); // cancel promise
  currentTasksForHash.splice(index, 1); // remove from array
  workerPoolLogger.info("Hash SERVICE: Cancelled hasher for this ID");
  // workerPoolLogger.info(currentTasks);
}

function cancelDeleteTaskInProcess(path: any) {
  const index = isHashBeingDone(path);
  workerPoolLogger.info(`DELETE SERVICE: Delete for ${path} already running`);
  currentTasksForDelete[index].promise.cancel(); // cancel promise
  currentTasksForDelete.splice(index, 1); // remove from array
  workerPoolLogger.info("DELETE SERVICE: Cancelled startup for this ID");
  // workerPoolLogger.info(currentTasks);
}

let contador = 0;
function currentTasksHandler(id: any) {
  // workerPoolLogger.info(currentTasks);
  //  const TIMEOUT = 30000;
  // Isto aqui eh uma proteçao, para que o id seja correto.
  let position = null;
  if (currentTasksForHash[currentTasksForHash.length - 1].pathId == id) {
    position = currentTasksForHash.length - 1;
  } else {
    position = currentTasksForHash
      .reverse()
      // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'task' implicitly has an 'any' type.
      .findIndex((task) => (task.pathId = id));
  }
  currentTasksForHash[position].promise
    // .timeout(TIMEOUT)
    // when the promise is resolved patch the tokens with 'training': 'uptodate',
    // patch the Model with a new updated date, and then write out the training file
    .then((result: any) => {
      switch (result.tipo) {
        case "COMPLETED_OK":
          contador += 1;
          workerPoolLogger.info(
            `PROMISE FINALIZADA: tipo: ${result.tipo} Path: ${result.path} Tempo: ${result.timeSpent} segundos Hash: ${result.hash}`
          );
          /*
          sendMsg(
            `Hash feito para arquivo: ${result.path} Hash: ${result.hash}`
          );
          */
          break;
        case "ERROR_EBUSY":
          workerPoolLogger.info(
            `PROMISE FINALIZADA: tipo: ${result.tipo} Tempo: ${result.timeSpent} segundos Path: ${result.path}`
          );
          break;
        case "ERROR_UNKNOWN":
          workerPoolLogger.info(
            `PROMISE FINALIZADA: tipo: ${result.tipo} Tempo: ${result.timeSpent} segundos Name: ${result.name} Message: ${result.message}`
          );
          break;

        default:
          workerPoolLogger.info(`Erro mensagem nao reconhecida`);
      }

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'HasherPool'.
      workerPoolLogger.info(HasherPool.stats());

      // remove finished task from runningTasks queue array
      // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'task' implicitly has an 'any' type.
      const index = currentTasksForHash.findIndex((task) => (task.pathId = id));
      currentTasksForHash.splice(index, 1);
      workerPoolLogger.info(
        `HASH SERVICE WORKERPOOL: Hashing finished for ${id}`
      );

      // Logic on successful resolve here
      // result is a json file which is saved to disk
    })
    .catch((err: any) => {
      workerPoolLogger.error("HASH SERVICE WORKERPOOL ERROR:", err);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'HasherPool'.
      workerPoolLogger.info(HasherPool.stats());
    })
    // WorkerPool seems to terminate its process by itself when all jobs have finished,
    // pool becomes null, so after all training jobs have completed, we have to instantiate pool again
    .then(function () {
      workerPoolLogger.info("HASH SERVICE WORKERPOOL: All workers finished.");
      workerPoolLogger.info(`Contador = ${contador}`);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'HasherPool'.
      if (HasherPool == null) {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'HasherPool'.
        HasherPool.terminate();
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'HasherPool'.
        HasherPool = workerpool.pool(`${__dirname}/hashpoolworker.js`, {
          maxWorkers: 9,
          workerType: "thread",
          maxQueueSize: 200000,
        });
      }
    });
}

function currentTasksHandlerOfDeletetaks(id: any) {
  // workerPoolLogger.info(currentTasks);
  //  const TIMEOUT = 30000;
  // Isto aqui eh uma proteçao, para que o id seja correto.
  let position = null;
  if (currentTasksForDelete[currentTasksForDelete.length - 1].pathId == id) {
    position = currentTasksForDelete.length - 1;
  } else {
    position = currentTasksForDelete
      .reverse()
      // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'task' implicitly has an 'any' type.
      .findIndex((task) => (task.pathId = id));
  }
  currentTasksForDelete[position].promise
    // .timeout(TIMEOUT)
    // when the promise is resolved patch the tokens with 'training': 'uptodate',
    // patch the Model with a new updated date, and then write out the training file
    .then((result: any) => {
      switch (result.tipo) {
        case "COMPLETED_OK":
          contador += 1;
          workerPoolLogger.info(
            `PROMISE FINALIZADA: tipo: ${result.tipo} Path: ${result.path} Tempo: ${result.timeSpent} segundos Hash: ${result.hash}`
          );
          break;
        case "ERROR_EBUSY":
          workerPoolLogger.info(
            `PROMISE FINALIZADA: tipo: ${result.tipo} Tempo: ${result.timeSpent} segundos Path: ${result.path}`
          );
          break;
        case "ERROR_UNKNOWN":
          workerPoolLogger.info(
            `PROMISE FINALIZADA: tipo: ${result.tipo} Tempo: ${result.timeSpent} segundos Name: ${result.name} Message: ${result.message}`
          );
          break;

        default:
          workerPoolLogger.info(`Erro mensagem nao reconhecida`);
      }

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'StartupDeletionPool'.
      workerPoolLogger.info(StartupDeletionPool.stats());

      // remove finished task from runningTasks queue array
      const index = currentTasksForDelete.findIndex(
        // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'task' implicitly has an 'any' type.
        (task) => (task.pathId = id)
      );
      currentTasksForDelete.splice(index, 1);
      workerPoolLogger.info(
        `STARTUP DELETE SERVICE WORKERPOOL: Startup finished for ${id}`
      );

      // Logic on successful resolve here
      // result is a json file which is saved to disk
    })
    .catch((err: any) => {
      workerPoolLogger.error("STARTUP DELETE SERVICE WORKERPOOL ERROR:", err);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'StartupDeletionPool'.
      workerPoolLogger.info(StartupDeletionPool.stats());
    })
    // WorkerPool seems to terminate its process by itself when all jobs have finished,
    // pool becomes null, so after all training jobs have completed, we have to instantiate pool again
    .then(function () {
      workerPoolLogger.info(
        "STARTUP DELETE SERVICE WORKERPOOL: All workers finished."
      );
      workerPoolLogger.info(`Contador = ${contador}`);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'StartupDeletionPool'.
      if (StartupDeletionPool == null) {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'StartupDeletionPool'.
        StartupDeletionPool.terminate();
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'StartupDeletionPool'.
        StartupDeletionPool = workerpool.pool(
          `${__dirname}/startupdeleteworker.js`,
          { maxWorkers: 9, workerType: "thread", maxQueueSize: 200000 }
        );
      }
    });
}

function exitHandler(options: any, exitCode: any) {
  if (options.cleanup) childLogger.info("exitHandler clean");
  if (exitCode || exitCode === 0) childLogger.info(`Exit code ${exitCode}`);
  db.close();
  if (options.exit) process.exit();
}

// do something when app is closing
process.on("exit", exitHandler.bind(null, { cleanup: true }));

// catches ctrl+c event
process.on("SIGINT", exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));

// catches uncaught exceptions
process.on("uncaughtException", exitHandler.bind(null, { exit: true }));