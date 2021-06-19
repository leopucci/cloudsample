const winston = require('winston');
const { app, BrowserWindow, ipcMain, systemPreferences, dialog, Tray, Menu } = require('electron');
// Check if Windows or Mac
const isWinOS = process.platform === 'win32';
const isMacOS = process.platform === 'darwin';
const isDev = require('electron-is-dev');
const machineIdSync = require('node-machine-id');

console.log('ExecPath', process.execPath);

process.on('message', (m) => {
    console.log('Got message:', m);
    //const h = blake2.createHash('blake2b', {digestLength: 32});
    //h.update(Buffer.from(m));
    //process.send(`Hash of ${m} is: ${h.digest('hex')}`);

    Startup();
    process.send(`VINDO DA CHILD`);
});




function Startup() {

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


}