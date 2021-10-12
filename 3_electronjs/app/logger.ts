const winston = require("winston");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'mainLogger... Remove this comment to see the full error message
const mainLogger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' }),
    // new winston.transports.Http({ host: 'localhost', port: 8080, level: 'error' }),
    new winston.transports.File({ filename: "mainlog.log" }),
    new winston.transports.Console(),
  ],
});

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'childLogge... Remove this comment to see the full error message
const childLogger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' }),
    // new winston.transports.Http({ host: 'localhost', port: 8080, level: 'error' }),
    new winston.transports.File({ filename: "mainlog.log" }),
    new winston.transports.Console(),
  ],
});

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chokidarLo... Remove this comment to see the full error message
const chokidarLogger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Http({
      host: "localhost",
      port: 8080,
      level: "error",
    }),
    new winston.transports.File({ filename: "fork.log" }),
    new winston.transports.Console(),
  ],
});

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'sqliteLogg... Remove this comment to see the full error message
const sqliteLogger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Http({
      host: "localhost",
      port: 8080,
      level: "error",
    }),
    new winston.transports.Console(),
  ],
});

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'workerPool... Remove this comment to see the full error message
const workerPoolLogger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Http({
      host: "localhost",
      port: 8080,
      level: "error",
    }),
    new winston.transports.Console(),
  ],
});

const alignColorsAndTimeChildLogger = winston.format.combine(
  winston.format.colorize({
    all: true,
  }),
  winston.format.label({
    label: "[CHILD]",
  }),
  winston.format.timestamp({
    format: "YY-MM-DD HH:MM:SS",
  }),
  winston.format.printf(
    (info: any) => ` ${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`
  )
);

const alignColorsAndTimeMainLogger = winston.format.combine(
  winston.format.colorize({
    all: true,
  }),
  winston.format.label({
    label: "[MAIN]",
  }),
  winston.format.timestamp({
    format: "YY-MM-DD HH:MM:SS",
  }),
  winston.format.printf(
    (info: any) => ` ${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`
  )
);

const alignColorsAndTimeWorkerPool = winston.format.combine(
  winston.format.colorize({
    all: true,
  }),
  winston.format.label({
    label: "[WORKERPOOL]",
  }),
  winston.format.timestamp({
    format: "YY-MM-DD HH:MM:SS",
  }),
  winston.format.printf(
    (info: any) => ` ${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`
  )
);

const alignColorsAndTimeSqlite = winston.format.combine(
  winston.format.colorize({
    all: true,
  }),
  winston.format.label({
    label: "[SQLITE]",
  }),
  winston.format.timestamp({
    format: "YY-MM-DD HH:MM:SS",
  }),
  winston.format.printf(
    (info: any) => ` ${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`
  )
);

const alignColorsAndTimeChokidar = winston.format.combine(
  winston.format.colorize({
    all: true,
  }),
  winston.format.label({
    label: "[CHOKIDARCHILD]",
  }),
  winston.format.timestamp({
    format: "YY-MM-DD HH:MM:SS",
  }),
  winston.format.printf(
    (info: any) => ` ${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`
  )
);

childLogger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      alignColorsAndTimeChildLogger
    ),
  })
);

mainLogger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      alignColorsAndTimeMainLogger
    ),
  })
);

chokidarLogger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      alignColorsAndTimeChokidar
    ),
  })
);
sqliteLogger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      alignColorsAndTimeSqlite
    ),
  })
);
workerPoolLogger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      alignColorsAndTimeWorkerPool
    ),
  })
);

module.exports = {
  childLogger,
  mainLogger,
  chokidarLogger,
  sqliteLogger,
  workerPoolLogger,
};
