const winston = require('winston');
const path = require('path');
const fs = require('fs');

// PEGUEI DAQUI https://levelup.gitconnected.com/better-logs-for-expressjs-using-winston-and-morgan-with-typescript-1c31c1ab9342

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

// Define your severity levels.
// With them, You can create log files,
// see or hide levels based on the running ENV.
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// This method set the current severity based on
// the current NODE_ENV: show all the log levels
// if the server was run in development mode; otherwise,
// if it was run in production, show only warn and error messages.
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define different colors for each level.
// Colors make the log message more visible,
// adding the ability to focus or ignore messages.
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
// defined above to the severity levels.
winston.addColors(colors);

// Chose the aspect of your log customizing the log format.
const format = winston.format.combine(
  enumerateErrorFormat(),
  // Add the message timestamp with the preferred format
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // Tell Winston that the logs must be colored
  winston.format.colorize({ all: true }),
  // Define the format of the message showing the timestamp, the level and the message
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

const isWin = process.platform === 'win32';
const isLinux = process.platform === 'linux';
const getRootDir = () => path.parse(process.cwd()).root;
let logDir;
if (isWin) {
  logDir = path.join(getRootDir(), 'POCKETCLOUD', 'LOGS'); // directory path you want to set
} else if (isLinux) {
  logDir = path.join(getRootDir(), 'opt', 'POCKETCLOUD', 'LOGS'); // directory path you want to set
}
if (!fs.existsSync(logDir)) {
  // Create the directory if it does not exist
  try {
    fs.mkdirSync(logDir, { recursive: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`ERRO tentando criar diretorios de log: ${logDir}`);
  }
}

// Define which transports the logger must use to print out messages.
// In this example, we are using three different transports
const transports = [
  // Allow the use the console to print the messages
  new winston.transports.Console(),
  // Allow to print all the error level messages inside the error.log file
  // AQUI TEM COMO RODAR LOG https://jojozhuang.github.io/tutorial/express-combine-morgan-and-winston/
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
  }),
  // Allow to print all the error message inside the all.log file
  // (also the error log that are also printed inside the error.log(
  new winston.transports.File({ filename: 'logs/all.log' }),
];

// Create the logger instance that has to be exported
// and used to log messages.
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

module.exports = logger;
