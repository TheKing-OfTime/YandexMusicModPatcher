import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

const { app, BrowserWindow } = require('electron');
const path = require('node:path');
import { handleApplicationEvents } from './events.js'
import { getNativeImg } from './utils.js';
import { getState } from "./state.js";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const icon = getNativeImg('icons/icon.ico').resize({
    width: 128,
    height: 128,
})

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        frame: true,
        width: 800,
        height: 800,
        minWidth: 530,
        minHeight: 620,
        // maxWidth: 650,
        // maxHeight: 800,
        icon,
        titleBarStyle: 'hidden',
        trafficLightPosition: {
            x: 20,
            y: 8
        },
        webPreferences: {
            devTools: true,
            webSecurity: true,
            nodeIntegrationInWorker: true,
            nodeIntegration: false,
            contextIsolation: true,
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });


    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    return mainWindow;
};

const state = getState();


app.whenReady().then(() => {
    const window = createWindow();

    if(installExtension) installExtension(REACT_DEVELOPER_TOOLS)
        .then((ext) => console.log(`Added Extension:  ${ext.name}`))
        .catch((err) => console.log('An error occurred: ', err));

    handleApplicationEvents(window);


    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
