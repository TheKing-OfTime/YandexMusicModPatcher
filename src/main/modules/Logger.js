"use strict";
const electronLog = require("electron-log");

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
    // Можно добавить кастомный форматтер, если потребуется
    // electronLog.transports.console.format = ...
    // electronLog.transports.file.format = ...
  }
}

module.exports = { Logger };
