import electron from "electron";

electron.contextBridge.exposeInMainWorld('CONSTANTS', {
    PLATFORM: process.platform,
});

electron.contextBridge.exposeInMainWorld('desktopEvents', {
    send(name, ...args) {
        console.log('Message sent', name, ...args);
        electron.ipcRenderer.send(name, ...args);
    },
    on(name, callback) {

        const listener = (event, ...args) => {
            console.log('listener', name, event, ...args);
            callback(event, ...args);
        }

        electron.ipcRenderer.on(name, listener);

        return () => {
            console.log('listener off', name, listener);
            electron.ipcRenderer.off(name, listener);
        }
    },
    invoke(name, ...args) {
        return electron.ipcRenderer.invoke(name, ...args);
    }
});
