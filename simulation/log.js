// logging setup
const winston = require('winston');

const simpleTimestamp = winston.format.printf(({ level, message, timestamp }) => `[${timestamp}] ${level}: ${message}`);

winston.configure({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        simpleTimestamp,
    ),
    transports: [
        new winston.transports.Console({ level: 'debug' }),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'debug.log', level: 'debug' }),
    ],
});

module.exports = winston;
