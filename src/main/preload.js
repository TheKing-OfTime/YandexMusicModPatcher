import electron from "electron";

electron.contextBridge.exposeInMainWorld('CONSTANTS', {
    PLATFORM: process.platform,
});

electron.contextBridge.exposeInMainWorld('desktopEvents', {
    send(name, ...args) {
        console.debug('Message sent', name, ...args);
        electron.ipcRenderer.send(name, ...args);
    },
    on(name, callback) {
        console.debug('listener on', name, callback);
        const listener = (event, ...args) => {
            console.debug('listener', name, event, ...args);
            callback(event, ...args);
        }

        electron.ipcRenderer.on(name, listener);

        return () => {
            console.debug('listener off', name, listener);
            electron.ipcRenderer.off(name, listener);
        }
    },
    invoke(name, ...args) {
        console.debug('invoked', name, ...args);
        return electron.ipcRenderer.invoke(name, ...args);
    },
    emit(name, ...args) {
        console.debug('emitted', name, ...args);
        return electron.ipcRenderer.emit(name, ...args);
    }
});
