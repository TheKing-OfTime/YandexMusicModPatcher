import electron from "electron";

electron.contextBridge.exposeInMainWorld('desktopEvents', {
    send(name, ...args) {
        electron.ipcRenderer.send(name, ...args);
    },
    on(name, listener) {
        electron.ipcRenderer.on(name, listener);
    },
    off(name, listener) {
        electron.ipcRenderer.off(name, listener);
    },
    invoke(name, ...args) {
        return electron.ipcRenderer.invoke(name, ...args);
    }
});
