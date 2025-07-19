"use strict";
const electronLog = require("electron-log");
electronLog.initialize();

const logLevel = 'info';

class Logger {
  scope;
  logger;
  constructor(scope) {
    this.scope = scope;
    this.logger = electronLog.scope(scope);
  }
  log(...data) {
    this.logger.log(...data);
  }
  info(...data) {
    this.logger.info(...data);
  }
  error(...data) {
    this.logger.error(...data);
  }
  warn(...data) {
    this.logger.warn(...data);
  }
  debug(...data) {
    this.logger.debug(...data);
  }
  verbose(...data) {
    this.logger.verbose(...data);
  }
  silly(...data) {
    this.logger.silly(...data);
  }
  withPrefix(...prefix) {
    const methods = [
      "log",
      "info",
      "error",
      "warn",
      "debug",
      "verbose",
      "silly",
    ];
    return methods.reduce((logger, method) => {
      logger[method] = (...data) => this.logger[method](...prefix, ...data);
      return logger;
    }, {});
  }
  static setupLogger() {
    electronLog.default.transports.console.format = formatLog;
    electronLog.default.transports.console.level = logLevel;
    electronLog.default.transports.file.format = formatLog;
    electronLog.default.transports.file.level = logLevel;
  }
}

const firstLine = (message) => {
  if (typeof message === "string") {
    const [line] = message.split("\n");
    return line;
  }
  return message;
};
const dateFormatter = new Intl.DateTimeFormat("ru", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  fractionalSecondDigits: 3,
  hour12: false,
});
const formatLog = ({ message }) => {
  const date = dateFormatter.format(message.date);
  const prefix = `[${date}] [${message.level}] (${message.scope})`;
  const data = message.data.map((chunk) =>
  chunk instanceof Error
  ? `${chunk.name} ${firstLine(chunk.message)}`
  : chunk,
  );
  return [prefix, ...data];
};

module.exports = { Logger };
