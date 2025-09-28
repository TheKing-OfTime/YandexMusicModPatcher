import electron from "electron";
import { Logger } from "./modules/Logger.js";
import config from './config.js';
const logger = new Logger("preload");

electron.contextBridge.exposeInMainWorld('CONSTANTS', {
    PLATFORM: process.platform,
    ARCH: process.arch,
    DEEPLINK_PROTOCOL: config.deeplinkProtocol,
    CONFIG_APP_VERSION: config.version,
});

electron.contextBridge.exposeInMainWorld('desktopEvents', {
    send(name, ...args) {
        logger.debug('Message sent', name, ...args);
        electron.ipcRenderer.send(name, ...args);
    },
    on(name, callback) {
        logger.debug('listener on', name, callback);
        const listener = (event, ...args) => {
            logger.debug('listener', name, event, ...args);
            callback(event, ...args);
        }

        electron.ipcRenderer.on(name, listener);

        return () => {
            logger.debug('listener off', name, listener);
            electron.ipcRenderer.off(name, listener);
        }
    },
    invoke(name, ...args) {
        logger.debug('invoked', name, ...args);
        return electron.ipcRenderer.invoke(name, ...args);
    },
    emit(name, ...args) {
        logger.debug('emitted', name, ...args);
        return electron.ipcRenderer.emit(name, ...args);
    }
});
