import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

const { app, BrowserWindow } = require('electron');
const path = require('node:path');
import { handleApplicationEvents } from './events.js'
import { getNativeImg } from './utils.js';
import { initState } from "./state.js";

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
        frame: false,
        width: 800,
        height: 800,
        minWidth: 530,
        minHeight: 620,
        // maxWidth: 650,
        // maxHeight: 800,
        icon,
        webPreferences: {
            devTools: true,
            webSecurity: true,
            nodeIntegrationInWorker: true,
            nodeIntegration: false,
            contextIsolation: true,
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Open the DevTools.
    //mainWindow.webContents.openDevTools();
    return mainWindow;
};

const state = initState();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    const window = createWindow();

    if(installExtension) installExtension(REACT_DEVELOPER_TOOLS)
        .then((ext) => console.log(`Added Extension:  ${ext.name}`))
        .catch((err) => console.log('An error occurred: ', err));

    handleApplicationEvents(window);

    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
