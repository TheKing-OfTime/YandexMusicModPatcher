import electron, { shell } from "electron";
import { installMod, getReleaseMetadata, isInstallPossible, updatePaths, checkMacPermissions } from "./patcher.js";
import { deleteLegacyYM } from "./utils.js";
import { getState } from "./state.js";
import { mainWindow } from "./index.js";
import Events from "./types/events.js";

const State = getState();

/**
 *
 * @param window {electron.BrowserWindow}
 */
export const handleApplicationEvents = (window) => {
    electron.ipcMain.on(Events.QUIT, ()=>{
        console.log('Received QUIT');
        electron.app.quit();
    });
    electron.ipcMain.on(Events.RESTART, ()=>{
        console.log('Received RESTART');
        electron.app.relaunch();
        electron.app.quit();
    });
    electron.ipcMain.on(Events.MINIMIZE, ()=>{
        console.log('Received MINIMIZE');
        window.minimize();
    });
    electron.ipcMain.on(Events.MAXIMIZE, ()=>{
        console.log('Received MAXIMIZE');
        window.isMaximized() ? window.unmaximize() : window.maximize();
    });
    electron.ipcMain.on(Events.PATCH, async () => {
        console.log('Received PATCH');
        try {
            const metadata = await getReleaseMetadata();
            const version = metadata.name;

            const callback = (progress, logLabel) => {
                sendPatchProgress(window, {
                    progress: progress,
                    taskLabel: progress == -1 ? `Error installing YandexMusicModClient ` : `Installing YandexMusicModClient ${version}...`,
                    logLabel: logLabel,
                })
            }

            await installMod(callback);
            sendPatchProgress(window, {
                progress: 0,
                taskLabel: `YandexMusicModClient ${version} installed`,
                logLabel: '',
            })
        } catch(e) {
            sendPatchProgress(window, {
                progress: -1,
                taskLabel: `Error installing YandexMusicModClient`,
                logLabel: e.message,
            })
        }
    });
    electron.ipcMain.on(Events.IS_INSTALL_POSSIBLE, async () => {
        console.log('Received IS_INSTALL_POSSIBLE');
        const callback = (progress, logLabel) => {
            sendPatchProgress(window, {
                progress: 0,
                taskLabel: `Checking if install possible...`,
                logLabel: logLabel,
            })
        }

        const isPossible = await isInstallPossible(callback);
        sendPatchProgress(window, {
            progress: 0,
            taskLabel: `Idle`,
            logLabel: '',
        })

        sendIsModInstallPossible(window, {isPossible: isPossible.status});
        if(isPossible.request) {
            switch(isPossible.request) {
                case 'REQUEST_YM_PATH':
                    requestYmPath(window, {});
                    break;
                case 'REQUEST_MAC_PERMISSIONS':
                    requestMacPermissions(window, {});
                    break;
                case 'REQUEST_LEGACY_YM_APP_DELETION':
                    requestLegacyYmAppDeletion(window, {});
                    break;
                default:
                    break;
            }
        }

    });

    electron.ipcMain.on(Events.SET_CUSTOM_YM_PATH, async (event, args) => {
        console.log('Received SET_CUSTOM_YM_PATH', args);
        updatePaths(args.path)
        electron.ipcMain.emit(Events.IS_INSTALL_POSSIBLE, {})
    })

    electron.ipcMain.on(Events.OPEN_EXPLORER_DIALOG, (event, args) => {
        console.log('Received OPEN_EXPLORER_DIALOG', args);
        electron.dialog.showOpenDialog(window, {
            properties: ['openDirectory'],
            title: 'Select Yandex Music Folder',
        }).then((result) => {
            if (result.canceled) {
                return;
            }
            explorerDialogResponse(window,{path: result.filePaths[0]});
        }).catch((err) => {
            console.error(err);
        });
    })

    electron.ipcMain.on(Events.OPEN_EXTERNAL_PERMISSIONS_SETTINGS, async (event, args) => {
        console.log('Received OPEN_EXTERNAL_PERMISSIONS_SETTINGS', args);
        if(!(await checkMacPermissions())) {
            shell.openExternal("x-apple.systempreferences:com.apple.preference.security?Privacy_AppBundles").then().catch((err) => {
                console.error(err);
            });
            electron.ipcMain.emit(Events.IS_INSTALL_POSSIBLE, {})
        }
    })
    electron.ipcMain.on(Events.DELETE_LEGACY_YM_APP, async (event, args) => {
        console.log('Received DELETE_LEGACY_YM_APP', args);
        await deleteLegacyYM()
        electron.ipcMain.emit(Events.IS_INSTALL_POSSIBLE, {})
    })
    electron.ipcMain.on(Events.UPDATE_STATE, (event, args) => {
        State.set(args.key, args.value);
    })
    electron.ipcMain.on(Events.READY, (event, args) => {
        console.log('Received READY', args);
        sendStateInitiated(undefined, State.state);
    })
}

export const sendPatchProgress = (window= mainWindow, args) => {
    window.webContents.send(Events.PATCH_PROGRESS, args);
    console.log('Sent PATCH_PROGRESS', args);
}

export const sendIsModInstallPossible = (window= mainWindow, args) => {
    window.webContents.send(Events.IS_INSTALL_POSSIBLE_RESPONSE, args);
    console.log('Sent IS_INSTALL_POSSIBLE_RESPONSE', args);
}

export const requestYmPath = (window= mainWindow, args) => {
    window.webContents.send(Events.REQUEST_YM_PATH, args);
    console.log('Sent REQUEST_YM_PATH', args);
}

export const requestMacPermissions = (window= mainWindow, args) => {
    window.webContents.send(Events.REQUEST_MAC_PERMISSIONS, args);
    console.log('Sent REQUEST_MAC_PERMISSIONS', args);
}

export const requestLegacyYmAppDeletion = (window= mainWindow, args) => {
    window.webContents.send(Events.REQUEST_LEGACY_YM_APP_DELETION, args);
    console.log('Sent REQUEST_LEGACY_YM_APP_DELETION', args);
}

export const explorerDialogResponse = (window= mainWindow, args) => {
    window.webContents.send(Events.EXPLORER_DIALOG_RESPONSE, args);
    console.log('Sent EXPLORER_DIALOG_RESPONSE', args);
}
export const sendStateUpdated = (window= mainWindow, state) => {
    window.webContents.send(Events.STATE_UPDATED, state);
    console.log('Sent STATE_UPDATED', state);
}
export const sendStateInitiated = (window= mainWindow, state) => {
    window.webContents.send(Events.STATE_INITIATED, state);
    console.log('Sent STATE_INITIATED', state);
}
