const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf } = format;

const customFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} : ${level} : ${message}`;
});

const logger = createLogger({
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:MM:SS" }),
        customFormat,
    ),
    transports: [
        // It will print all the logs on the console
        new transports.Console(),
        // It will store all the logs in a file named `combined.log`
        new transports.File({ filename: "combined.log" })
    ]
});

module.exports = logger;
