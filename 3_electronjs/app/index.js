const { app, BrowserWindow, ipcMain, systemPreferences, dialog, Tray, Menu } = require('electron');
const path = require('path');
const os = require('os');
const EventEmitter = require('events');
const { autoUpdater } = require('electron-updater');
const Positioner = require('electron-positioner');//electron-traywindow-positioner talvez seja melhor
const { fork, spawn } = require('child_process');
const uuidv4 = require('uuid');
// local dependencies
const io = require('./main/io');
const chokidar = require('chokidar');
const sqlite3 = require('better-sqlite3-sqleet');
const workerpool = require('workerpool');
var mqtt = require('mqtt')
// One-liner for current directory
var fs = require('fs');
var currentTasksForHash = [];
var currentTasksForDelete = [];
var initialScanEnded = false;
const winston = require('winston');
// Check if Windows or Mac
const isWinOS = process.platform === 'win32';
const isMacOS = process.platform === 'darwin';
const isDev = require('electron-is-dev');
const machineIdSync = require('node-machine-id');
//Todo: fazer crash report online https://www.thorsten-hans.com/electron-crashreporter-stay-up-to-date-if-your-app-fucked-up/


const p = fork(path.join(__dirname, 'child.js'), ['hello'], {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
});
p.stdout.on('data', (d) => {
    console.log('data', '[stdout-main-fork] ' + d.toString());
});
p.stderr.on('data', (d) => {
    console.log('data', '[stderr-main-fork] ' + d.toString());
});
p.send('hello');
p.on('message', (m) => {
    console.log('data', '[ipc-main-fork] ' + m);
});



if (isWinOS) {
    syncDir = app.getPath('home') + '\\PocketCloud\\';
    dbDir = app.getPath("userData") + '\\app\\misc';
    dbFile = dbDir + '\\misc.data'
    dbExists = fs.existsSync(dbFile);
} else {
    syncDir = app.getPath('home') + '/PocketCloud/';
    dbDir = app.getPath("userData") + '/app/misc';
    dbFile = dbDir + '/misc.data'
    dbExists = fs.existsSync(dbFile);
}


const chokidarLogger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //
        //new winston.transports.File({ filename: 'error.log', level: 'error' }),
        //new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Http({ host: 'localhost', port: 8080, level: 'error' })
    ],
});

const sqliteLogger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //
        //new winston.transports.File({ filename: 'error.log', level: 'error' }),
        //new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Http({ host: 'localhost', port: 8080, level: 'error' })
    ],
});

const workerPoolLogger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //
        //new winston.transports.File({ filename: 'error.log', level: 'error' }),
        //new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Http({ host: 'localhost', port: 8080, level: 'error' })
    ],
});



let alignColorsAndTimeSqlite = winston.format.combine(
    winston.format.colorize({
        all: true
    }),
    winston.format.label({
        label: '[SQLITE]'
    }),
    winston.format.timestamp({
        format: "YY-MM-DD HH:MM:SS"
    }),
    winston.format.printf(
        info => ` ${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`
    )
);

let alignColorsAndTimeWorkerPool = winston.format.combine(
    winston.format.colorize({
        all: true
    }),
    winston.format.label({
        label: '[WORKERPOOL]'
    }),
    winston.format.timestamp({
        format: "YY-MM-DD HH:MM:SS"
    }),
    winston.format.printf(
        info => ` ${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`
    )
);

let alignColorsAndTimeChokidar = winston.format.combine(
    winston.format.colorize({
        all: true
    }),
    winston.format.label({
        label: '[CHOKIDAR]'
    }),
    winston.format.timestamp({
        format: "YY-MM-DD HH:MM:SS"
    }),
    winston.format.printf(
        info => ` ${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`
    )
);

if (isDev) {
    chokidarLogger.add(new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), alignColorsAndTimeChokidar),
    }));
    sqliteLogger.add(new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), alignColorsAndTimeSqlite),
    }));
    workerPoolLogger.add(new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), alignColorsAndTimeWorkerPool),
    }));
} else {
    console.log('Running in production');
}

if (!dbExists) {
    sqliteLogger.info('banco nao existe');
    fs.mkdirSync(dbDir, { recursive: true })
} else {
    sqliteLogger.info('banco existe');
}

var db = new sqlite3(dbFile, { verbose: console.log }); // fileName,internalDir,Status,FullFileHash,Status

if (!dbExists) {
    //Esta funcao vai inicializar tudo. 
    //Criar pasta tambem se nao existir
    //Mandar uma mensagem pro servidor dizendo que é o primeiro download e baixar toda a listagem de arquivos que tem lá. 
    //A partir dai baixar todos. 
    db.exec('CREATE TABLE `instalation` ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,  `instalationId` TEXT, `machineId` TEXT )');
    const stmt = db.prepare(`INSERT INTO instalation(instalationId,machineId) VALUES(?,?)`);
    let machineId = machineIdSync.machineIdSync({ original: true })
    info = stmt.run(uuidv4(), machineId);
    db.exec('CREATE TABLE `files` ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,  `internalPath` TEXT, `fileName` TEXT, `internalDir` TEXT, `status` TEXT,`delayedHashTobeDone` INTEGER,`startupFileCount` INTEGER,`size` TEXT, `fullFileHash` TEXT)');
    //numa primeira execução, a idéia é baixar tudo do servidor. 
    //entao a pasta vai ser criada e movida caso exista arquivos... na hora da desinstalaçao. só pra garantir que nao havera cagada.
    //entao pro SW eu sempre vou considerar a pasta vazia? pq ele vai criar e rodar. tenho que por o sw pra rodar ao instalar, dae nao tem furo. 
}


const HasherPool = workerpool.pool(__dirname + '/worker.js', { maxWorkers: 900000, workerType: 'thread', maxQueueSize: 200000 });

const StartupDeletionPool = workerpool.pool(__dirname + '/worker.js', { maxWorkers: 900000, workerType: 'thread', maxQueueSize: 200000 });


//MQTT
var resultadoConsulta = undefined;
try {
    const stmt = db.prepare('SELECT instalationId, machineId FROM instalation WHERE id  = 1');
    resultadoConsulta = stmt.get();
} catch (error) {
    sqliteLogger.error('Erro: ' + error);
}
var client = mqtt.connect('mqtt://10.8.0.1', { username: 'usuariodeteste', password: 'leozin10', clientId: resultadoConsulta.instalationId + resultadoConsulta.machineId })

client.on('connect', function () {
    console.log("mqtt connect")
    client.subscribe('canaldeteste', function (err) {
        if (!err) {
            //client.publish('presence', 'Hello mqtt')
            console.log("mqtt subscribe")
        } else {
            console.log(err)
        }
    })
})

client.on('close', function () {
    console.log("mqtt disconected")
})

client.on('offline', function () {
    console.log("mqtt offline")
})

client.on('reconnect', function () {
    console.log("mqtt reconnecting started")
})

client.on('error', function (error) {
    console.log("mqtt error: " + error)

})


client.on('message', function (topic, message) {
    // message is Buffer
    console.log('MQTT MESSAGE ' + message.toString())
    client.end()
})

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
function delayedHashAoIniciar() {

    //loopar no banco pegando arquivos que nao foram encontrados e testar o acesso no filesystem..
    //nao achou no filesystem, marco deletado no banco e gero evento. 
    var resultadoConsulta = undefined;
    try {
        const stmt = db.prepare('SELECT id, internalPath, fileName,size FROM files WHERE startupFileCount = ?');
        for (const arquivo of stmt.iterate()) {
            if (fs.existsSync(path)) {
                //file exists
            }
        }
    } catch (error) {
        sqliteLogger.error('Erro: ' + error);
    }
    if (resultadoConsulta == undefined) {
        console.log(`Nao consegui encontrar no banco um internalPath = ` + internalPath);

    }



    //funçao que faz hash prioritario, 
    //loopa no banco pegando da tabela os arquivos que mudaram de tamanho. 
}

function isHashBeingDone(id) {
    return currentTasksForHash.findIndex(task => task.pathId === id);
}

function isDeleteBeingDone(id) {
    return currentTasksForDelete.findIndex(task => task.pathId === id);
}


chokidarLogger.info("Watching " + syncDir);
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
    .on('add', (path, stats) => {
        chokidarLogger.info(`File ${path} has been added: ` + stats.size + 'bytes');
        var fileIndex = '';
        var fileName = '';
        var filePureName = '';
        var filePureType = '';
        var internalPath = '';
        var internalDir = '';
        if (isWinOS) {
            internalPath = path.substr(syncDir.length);
            fileIndex = internalPath.lastIndexOf('\\') + 1;
            internalDir = internalPath.substring(0, fileIndex - 1);
            fileName = internalPath.substr(fileIndex);
            filePureName = fileName.split('.')[0];
            filePureType = fileName.split('.')[1];
        } else {
            internalPath = path.substr(syncDir.length);
            fileIndex = path.lastIndexOf('/') + 1;
            internalDir = internalPath.substring(0, fileIndex - 1);
            fileName = path.substr(fileIndex);
            filePureName = fileName.split('.')[0];
            filePureType = fileName.split('.')[1];
        }


        //File C: \Users\Leo\PocketCloud\Nova pasta\Novo Documento de Texto - Copia.txt has been added 6bytes
        chokidarLogger.info(`File ${path} has been added: ` + stats.size + 'bytes');
        chokidarLogger.info('syncDir.length:  ' + syncDir.length); //syncDir.length  25
        chokidarLogger.info('fileIndex: ' + fileIndex);  //fileIndex 11
        chokidarLogger.info('internalPath: ' + internalPath); //internalPath Nova pasta\Novo Documento de Texto - Copia.txt
        chokidarLogger.info('internalDir: ' + internalDir);//internalDir Nova pasta
        chokidarLogger.info('fileName: ' + fileName);//fileName Novo Documento de Texto - Copia.txt
        chokidarLogger.info('filePureName: ' + filePureName);//filePureName Novo Documento de Texto - Copia
        chokidarLogger.info('filePureType: ' + filePureType);//filePureType txt
        var status = 'Incluso';
        //'Hasheado'
        //'Uploading'
        //'Sincronizado'
        //eu estou inserindo, mas nao estou verificando. 
        //path completo pode ser primary key.
        //se ja existir, e for 
        var resultadoConsulta = undefined;
        try {
            const stmt = db.prepare('SELECT id, internalPath, fileName,size FROM files WHERE internalPath  = ?');
            resultadoConsulta = stmt.get(internalPath);
        } catch (error) {
            sqliteLogger.error('Erro: ' + error);
        }
        if (resultadoConsulta == undefined) {
            console.log(`Nao consegui encontrar no banco um internalPath = ` + internalPath);

        }

        //Se ja tiver iniciado o monitoramento da pasta, entao age normalmente. 
        if (initialScanEnded) {
            chokidarLogger.info('Ja terminou o scan inicial. initialScanEnded = TRUE');
            //se tiver resultado, faz update e faz hash
            if (resultadoConsulta) {
                var info;
                try {
                    const stmt = db.prepare(`UPDATE files SET size = ? WHERE id = ?`);
                    info = stmt.run(stats.size, resultadoConsulta.id);
                    sqliteLogger.info(`Row(s) updated: ${info.changes}`);
                } catch (error) {
                    sqliteLogger.error('Erro: ' + error);
                    return;
                }
            } else {
                var info;
                try {
                    info = db.prepare(`INSERT INTO files(internalPath,fileName,internalDir,status,size) VALUES(?,?,?,?,?)`)
                        .run(internalPath, fileName, internalDir, status, stats.size);
                } catch (error) {
                    sqliteLogger.error('Erro: ' + error);
                    return;
                }
                sqliteLogger.info(`Row(s) inserted: ${info.changes}`);

            }
            startOrRestartHashingThread(syncDir, path);
        } else {//initialScanEnded == false
            chokidarLogger.info('Startup do chokidar... initialScanEnded = FALSE');
            //initialScanEnded == false quando inicia o sistema
            //Todos os chamados que tiverem false, eu tenho que dar delay.. 
            //vai dar delay por causa da inicialização do sistema. 
            //entao eu coloco numa fila, e só vou hashear a fila depois de 30 segundos, quando o 
            //sistema ja tiver iniciado.
            if (resultadoConsulta == undefined) {
                chokidarLogger.info('Nao existe a linha do arquivo no banco, adicionando e fazendo hash');
                //Nao existe a linha, insere e faz hash na hora.
                var info;
                try {
                    info = db.prepare(`INSERT INTO files(internalPath,fileName,internalDir,status,size,startupFileCount) VALUES(?,?,?,?,?,?)`)
                        .run(internalPath, fileName, internalDir, status, stats.size, 1);
                } catch (error) {
                    sqliteLogger.error('Erro: ' + error);
                    return;
                }
                sqliteLogger.info(`Row(s) inserted: ${info.changes}`);
                startOrRestartHashingThread(syncDir, path);
            } else {
                //Existe a linha e o tamanho bate, vai fazer hash com delay. salva no banco a flag.
                if (resultadoConsulta.size == stats.size) {
                    chokidarLogger.info('Existe a linha e o tamanho bate, vai fazer hash com delay. salva no banco a flag.');
                    var info;
                    try {
                        const stmt = db.prepare(`UPDATE files SET delayedHashTobeDone = 1, startupFileCount = 1 WHERE id = ?`);
                        info = stmt.run(resultadoConsulta.id);
                    } catch (error) {
                        sqliteLogger.error('Erro: ' + error);
                        return;
                    }
                    sqliteLogger.info(`Row(s) updated: ${info.changes}`);

                } else {
                    //Existe a linha e o tamanho nao bate, vai fazer update e hash na hora.
                    chokidarLogger.info('Existe a linha e o tamanho nao bate, vai fazer hash na hora.');
                    var info;
                    try {
                        const stmt = db.prepare(`UPDATE files SET size = ?, startupFileCount = 1 WHERE id = ?`);
                        info = stmt.run(stats.size, resultadoConsulta.id);
                    } catch (error) {
                        sqliteLogger.error('Erro: ' + error);
                        return;
                    }
                    sqliteLogger.info(`Row(s) updated: ${info.changes}`);
                    startOrRestartHashingThread(syncDir, path);
                }
            }
        }
    });

watcher.on('change', (path, stats) => {
    startOrRestartHashingThread(syncDir, path);

    chokidarLogger.info(`File ${path} has been changed ` + stats.size + 'bytes')
});
watcher.on('unlink', path => {
    chokidarLogger.info(`File ${path} has been removed `)
});

// More possible events.
watcher.on('addDir', (path, stats) => {
    chokidarLogger.info(`Directory ${path} has been added ` + stats.size + 'bytes')
});
watcher.on('unlinkDir', path => {
    chokidarLogger.info(`Directory ${path} has been removed2`)
});
watcher.on('error', error => {
    chokidarLogger.info(`Watcher error: ${error}`)
});
watcher.on('ready', () => {
    //Aqui eu tenho que re-escanear o diretorio todo, e bater com o banco.
    chokidarLogger.info('Initial scan complete. Ready for changes');
    initialScanEnded = true;
    //Funcao que vai hashear com delay, os arquivos da pasta. 
    setTimeout(delayedHashAoIniciar, 5000);
});
//watcher.on('raw', (event, path, details) => { // internal
//  chokidarLogger.info('Raw event info:', event, path, details);
//});

function executaHashTaskNaThread(path, pathId, syncDir) {
    const task = {
        fullPath: path,
        pathId: pathId,
        promise: HasherPool.exec('fileHasherThread', [
            { fullPath: path, pathId: pathId, syncDir: syncDir }
        ])
    };
    currentTasksForHash.push(task);
}

function executaDeleteTaskNaThread(path, syncDir) {
    const task = {
        pathId: pathId,
        promise: StartupDeletionPool.exec('fileDeletionThread', [
            { db: db, pathId: pathId, syncDir: syncDir }
        ])
    };
    currentTasksForDelete.push(task);

    currentTasksHandlerOfDeletetaks(pathId);
}
function startOrRestartHashingThread(syncDir, path) {

    pathId = path.split(syncDir)[1];
    if (isHashBeingDone(pathId) != -1) {
        cancelHashTaskInProcess(pathId);
    }

    workerPoolLogger.info(
        `HASH SERVICE: CREATING NEW Hasher for ${path} `
    );

    //process.exit(1);
    // Initialise a training thread
    // pool.exec returns a promise we will resolve later
    // in currentTasksHandler()

    // create a new task for the queue containing the id and the promise

    executaHashTaskNaThread(path, pathId, syncDir);


    // Run the promise handler
    currentTasksHandler(pathId);

}

function startOrRestartDeleteThread(syncDir, path) {

    pathId = path.split(syncDir)[1];
    if (isDeleteBeingDone(pathId) != -1) {
        cancelDeleteTaskInProcess(pathId);
    }

    workerPoolLogger.info(
        `DELETE SERVICE: CREATING NEW Hasher for ${path} `
    );

    //process.exit(1);
    // Initialise a training thread
    // pool.exec returns a promise we will resolve later
    // in currentTasksHandler()

    // create a new task for the queue containing the id and the promise
    pathId = 'StartupDelete';
    executaDeleteTaskNaThread(path, pathId, syncDir);


    // Run the promise handler
    currentTasksHandlerOfDeletetaks(pathId);

}

function cancelHashTaskInProcess(path) {
    let index = isHashBeingDone(path);
    workerPoolLogger.info(
        `HASH SERVICE: Hasher for ${path} already running`
    );
    currentTasksForHash[index].promise.cancel(); // cancel promise
    currentTasksForHash.splice(index, 1); // remove from array
    workerPoolLogger.info('Hash SERVICE: Cancelled hasher for this ID');
    //workerPoolLogger.info(currentTasks);
}

function cancelDeleteTaskInProcess(path) {
    let index = isHashBeingDone(path);
    workerPoolLogger.info(
        `DELETE SERVICE: Delete for ${path} already running`
    );
    currentTasksForDelete[index].promise.cancel(); // cancel promise
    currentTasksForDelete.splice(index, 1); // remove from array
    workerPoolLogger.info('DELETE SERVICE: Cancelled startup for this ID');
    //workerPoolLogger.info(currentTasks);
}

var contador = 0;
function currentTasksHandler(id) {
    //workerPoolLogger.info(currentTasks);
    //  const TIMEOUT = 30000;
    //Isto aqui eh uma proteçao, para que o id seja correto. 
    var position = null;
    if (currentTasksForHash[currentTasksForHash.length - 1].pathId == id) {
        position = currentTasksForHash.length - 1;
    } else {
        position = currentTasksForHash.reverse().findIndex(
            task => (task.pathId = id)
        );
    }
    currentTasksForHash[position].promise
        // .timeout(TIMEOUT)
        // when the promise is resolved patch the tokens with 'training': 'uptodate',
        // patch the Model with a new updated date, and then write out the training file
        .then(result => {
            switch (result.tipo) {
                case 'COMPLETED_OK':
                    contador = contador + 1;
                    workerPoolLogger.info("PROMISE FINALIZADA: tipo: " + result.tipo + " Path: " + result.path + " Tempo: " + result.timeSpent + " segundos Hash: " + result.hash);
                    break;
                case 'ERROR_EBUSY':
                    workerPoolLogger.info("PROMISE FINALIZADA: tipo: " + result.tipo + " Tempo: " + result.timeSpent + " segundos Path: " + result.path);
                    break;
                case 'ERROR_UNKNOWN':
                    workerPoolLogger.info("PROMISE FINALIZADA: tipo: " + result.tipo + " Tempo: " + result.timeSpent + " segundos Name: " + result.name + " Message: " + result.message);
                    break;

                default:
                    workerPoolLogger.info(`Erro mensagem nao reconhecida`);
            }

            workerPoolLogger.info(HasherPool.stats());

            // remove finished task from runningTasks queue array
            const index = currentTasksForHash.findIndex(
                task => (task.pathId = id)
            );
            currentTasksForHash.splice(index, 1);
            workerPoolLogger.info(
                `HASH SERVICE WORKERPOOL: Hashing finished for ${id}`
            );

            // Logic on successful resolve here
            // result is a json file which is saved to disk

        })
        .catch(err => {
            workerPoolLogger.error('HASH SERVICE WORKERPOOL ERROR:', err);
            workerPoolLogger.info(HasherPool.stats());
        })
        // WorkerPool seems to terminate its process by itself when all jobs have finished,
        // pool becomes null, so after all training jobs have completed, we have to instantiate pool again
        .then(function () {
            workerPoolLogger.info('HASH SERVICE WORKERPOOL: All workers finished.');
            workerPoolLogger.info('Contador = ' + contador);
            if (HasherPool == null) {
                HasherPool.terminate();
                HasherPool = workerpool.pool(__dirname + '/worker.js', { maxWorkers: 9, workerType: 'thread', maxQueueSize: 200000 });
            }

        });
}

function currentTasksHandlerOfDeletetaks(id) {
    //workerPoolLogger.info(currentTasks);
    //  const TIMEOUT = 30000;
    //Isto aqui eh uma proteçao, para que o id seja correto. 
    var position = null;
    if (currentTasksForDelete[currentTasksForDelete.length - 1].pathId == id) {
        position = currentTasksForDelete.length - 1;
    } else {
        position = currentTasksForDelete.reverse().findIndex(
            task => (task.pathId = id)
        );
    }
    currentTasksForDelete[position].promise
        // .timeout(TIMEOUT)
        // when the promise is resolved patch the tokens with 'training': 'uptodate',
        // patch the Model with a new updated date, and then write out the training file
        .then(result => {
            switch (result.tipo) {
                case 'COMPLETED_OK':
                    contador = contador + 1;
                    workerPoolLogger.info("PROMISE FINALIZADA: tipo: " + result.tipo + " Path: " + result.path + " Tempo: " + result.timeSpent + " segundos Hash: " + result.hash);
                    break;
                case 'ERROR_EBUSY':
                    workerPoolLogger.info("PROMISE FINALIZADA: tipo: " + result.tipo + " Tempo: " + result.timeSpent + " segundos Path: " + result.path);
                    break;
                case 'ERROR_UNKNOWN':
                    workerPoolLogger.info("PROMISE FINALIZADA: tipo: " + result.tipo + " Tempo: " + result.timeSpent + " segundos Name: " + result.name + " Message: " + result.message);
                    break;

                default:
                    workerPoolLogger.info(`Erro mensagem nao reconhecida`);
            }

            workerPoolLogger.info(StartupDeletionPool.stats());

            // remove finished task from runningTasks queue array
            const index = currentTasksForDelete.findIndex(
                task => (task.pathId = id)
            );
            currentTasksForDelete.splice(index, 1);
            workerPoolLogger.info(
                `STARTUP DELETE SERVICE WORKERPOOL: Startup finished for ${id}`
            );

            // Logic on successful resolve here
            // result is a json file which is saved to disk

        })
        .catch(err => {
            workerPoolLogger.error('STARTUP DELETE SERVICE WORKERPOOL ERROR:', err);
            workerPoolLogger.info(StartupDeletionPool.stats());
        })
        // WorkerPool seems to terminate its process by itself when all jobs have finished,
        // pool becomes null, so after all training jobs have completed, we have to instantiate pool again
        .then(function () {
            workerPoolLogger.info('STARTUP DELETE SERVICE WORKERPOOL: All workers finished.');
            workerPoolLogger.info('Contador = ' + contador);
            if (StartupDeletionPool == null) {
                StartupDeletionPool.terminate();
                StartupDeletionPool = workerpool.pool(__dirname + '/worker.js', { maxWorkers: 9, workerType: 'thread', maxQueueSize: 200000 });
            }

        });
}




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
    db.close();
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


