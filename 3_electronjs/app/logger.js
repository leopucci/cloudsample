const winston = require('winston');

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
        new winston.transports.Http({ host: 'localhost', port: 8080, level: 'error' }),
        new winston.transports.File({ filename: 'fork.log' })
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

let alignColorsAndTimeChokidar = winston.format.combine(
    winston.format.colorize({
        all: true
    }),
    winston.format.label({
        label: '[CHOKIDARCHILD]'
    }),
    winston.format.timestamp({
        format: "YY-MM-DD HH:MM:SS"
    }),
    winston.format.printf(
        info => ` ${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`
    )
);
chokidarLogger.add(new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), alignColorsAndTimeChokidar),
}));
sqliteLogger.add(new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), alignColorsAndTimeSqlite),
}));
workerPoolLogger.add(new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), alignColorsAndTimeWorkerPool),
}));



module.exports = {
  chokidarLogger,
  sqliteLogger,
  workerPoolLogger,
};