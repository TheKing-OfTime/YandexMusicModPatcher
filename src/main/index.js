import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { handleApplicationEvents, handleProcessErrors } from './events.js'
import { handleDeeplink } from './modules/handleDeeplinks.js';
import { getNativeImg } from './modules/utils.js';
import { getState } from "./modules/state.js";
import { registerSchemes, isDevelopment } from './modules/development.js';
import { checkForSingleInstance } from './modules/singleInstance.js';
import electron, { app, BrowserWindow } from 'electron';
import config from './config.js';
import { Logger } from "./modules/Logger.js";

Logger.setupLogger();

const logger = new Logger("main");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

if( isDevelopment ) {
    registerSchemes();
}

checkForSingleInstance();

handleProcessErrors();

const icon = getNativeImg('icons/icon.ico').resize({
    width: 128,
    height: 128,
})

export let mainWindow = null;

if (!electron.app.isDefaultProtocolClient(config.deeplinkProtocol)) {
    electron.app.setAsDefaultProtocolClient(config.deeplinkProtocol);
    logger.log('Deeplink registered:', `${config.deeplinkProtocol}://`);
} else {
    logger.log('Deeplink already registered:', `${config.deeplinkProtocol}://`);
}

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
    mainWindow = window;

    handleDeeplink(window);

    if(installExtension) installExtension(REACT_DEVELOPER_TOOLS)
        .then((ext) => logger.log(`Added Extension:  ${ext?.name}`))
        .catch((err) => logger.log('An error occurred: ', err));

    handleApplicationEvents(window);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            mainWindow = createWindow();
        }
    });
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
