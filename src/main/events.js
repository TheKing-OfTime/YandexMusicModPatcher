import electron, { shell } from "electron";
import { installMod, getReleaseMetadata, isInstallPossible, updatePaths, checkMacPermissions, clearCaches } from "./modules/patcher.js";
import { handleDeeplinkOnApplicationStartup } from "./modules/handleDeeplinks.js";
import { deleteLegacyYM } from "./modules/utils.js";
import { getState } from "./modules/state.js";
import { mainWindow } from "./index.js";
import Events from "./types/Events.js";
import { Logger } from "./modules/Logger.js";

const logger = new Logger("events");
const State = getState();

export const handleProcessErrors = () => {
    process.on('uncaughtException', (error) => {
        logger.error('Uncaught Exception:', error, error.stack);
        sendLogEntryCreate(undefined, {
            progress: -1,
            taskLabel: `Uncaught Exception`,
            logLabel: `${error.message} ${error.stack}`,
            logLevel: 'err',
        })
    });

    process.on('unhandledRejection', (error) => {
        logger.error('Unhandled Rejection:', error, error.stack);
        sendLogEntryCreate(undefined, {
            progress: -1,
            taskLabel: `Unhandled Rejection`,
            logLabel: `${error.message} ${error.stack}`,
            logLevel: 'err',
        })
    });
}

/**
 *
 * @param window {electron.BrowserWindow}
 */
export const handleApplicationEvents = (window) => {
    electron.ipcMain.on(Events.QUIT, ()=>{
        logger.log('Received QUIT');
        electron.app.quit();
    });
    electron.ipcMain.on(Events.RESTART, ()=>{
        logger.log('Received RESTART');
        electron.app.relaunch();
        electron.app.quit();
    });
    electron.ipcMain.on(Events.MINIMIZE, ()=>{
        logger.log('Received MINIMIZE');
        window.minimize();
    });
    electron.ipcMain.on(Events.MAXIMIZE, ()=>{
        logger.log('Received MAXIMIZE');
        window.isMaximized() ? window.unmaximize() : window.maximize();
    });
    electron.ipcMain.on(Events.PATCH, async (event, args) => {
        logger.log('Received PATCH');
        try {
            const metadata = await getReleaseMetadata();
            const version = metadata?.name;

            const callback = (progress, logLabel, subTaskLabel = undefined, logLevel='log') => {
                let taskLabel = "";
                let logLevelFinal = logLevel;

                switch (progress) {
                    case -1:
                        taskLabel = `Error installing YandexMusicModClient`;
                        subTaskLabel = '';
                        logLevelFinal = 'err';
                        break;

                    case 1:
                        taskLabel = `YandexMusicModClient ${version} installed`;
                        subTaskLabel = '';
                        break;
                    case 2:
                        progress = 0;
                        subTaskLabel = '';
                    case 0:
                        taskLabel = `Idle`;
                        break;
                    default:
                        taskLabel = `Installing YandexMusicModClient ${version}...`;
                        break;
                }


                sendPatchProgress(window, {
                    progress: progress,
                    taskLabel: taskLabel,
                    logLabel: logLabel,
                    logLevel: logLevelFinal,
                    subTaskLabel: subTaskLabel ?? logLabel,
                })
            }

            await installMod(callback, args ?? {});
            sendPatchProgress(window, {
                progress: 0,
                taskLabel: `YandexMusicModClient ${version} installed`,
                logLabel: '',
            })
        } catch(e) {
            sendPatchProgress(window, {
                progress: -1,
                taskLabel: `Error installing YandexMusicModClient`,
                logLabel: `${e.message} ${e.stack}`,
            })
        }
    });
    electron.ipcMain.on(Events.IS_INSTALL_POSSIBLE, async () => {
        logger.log('Received IS_INSTALL_POSSIBLE');
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
        logger.log('Received SET_CUSTOM_YM_PATH', args);
        updatePaths(args.path)
        electron.ipcMain.emit(Events.IS_INSTALL_POSSIBLE, {})
    })

    electron.ipcMain.on(Events.OPEN_EXPLORER_DIALOG, (event, args) => {
        logger.log('Received OPEN_EXPLORER_DIALOG', args);
        electron.dialog.showOpenDialog(window, {
            properties: ['openDirectory'],
            title: 'Select Yandex Music Folder',
        }).then((result) => {
            if (result.canceled) {
                return;
            }
            explorerDialogResponse(window,{path: result.filePaths[0]});
        }).catch((err) => {
            logger.error(err);
        });
    })

    electron.ipcMain.on(Events.OPEN_EXTERNAL_PERMISSIONS_SETTINGS, async (event, args) => {
        logger.log('Received OPEN_EXTERNAL_PERMISSIONS_SETTINGS', args);
        if(!(await checkMacPermissions())) {
            shell.openExternal("x-apple.systempreferences:com.apple.preference.security?Privacy_AppBundles").then().catch((err) => {
                logger.error(err);
            });
            electron.ipcMain.emit(Events.IS_INSTALL_POSSIBLE, {})
        }
    })
    electron.ipcMain.on(Events.DELETE_LEGACY_YM_APP, async (event, args) => {
        logger.log('Received DELETE_LEGACY_YM_APP', args);
        await deleteLegacyYM()
        electron.ipcMain.emit(Events.IS_INSTALL_POSSIBLE, {})
    })
    electron.ipcMain.on(Events.UPDATE_STATE, (event, args) => {
        State.set(args.key, args.value);
    })
    electron.ipcMain.on(Events.INIT, (event, args) => {
        logger.log('Received INIT', args);
        sendStateInitiated(undefined, State.state);
    })
    electron.ipcMain.on(Events.READY_TO_PATCH, (event, args) => {
        logger.log('Received READY_TO_PATCH', args);
        handleDeeplinkOnApplicationStartup();
        State.get('onReadyEventsQueue').forEach((event) => {
            event();
        })
    })
    electron.ipcMain.on(Events.INSTALL_ALL_UPDATES, (event, args) => {
        logger.log('Received INSTALL_ALL_UPDATES', args);
        electron.ipcMain.emit(Events.PATCH, { patchType: State.get('patchType') || 'default' });
    })

    electron.ipcMain.on(Events.CLEAR_CACHES, (event, args) => {
        logger.log('Received CLEAR_CACHES', args);

        const callback = (progress, logLabel, subTaskLabel = undefined, logLevel='log') => {
            let taskLabel = "";
            let logLevelFinal = logLevel;

            switch (progress) {
                case -1:
                    taskLabel = `Error clearing caches`;
                    subTaskLabel = '';
                    logLevelFinal = 'err';
                    break;

                case 1:
                    taskLabel = `Caches cleared`;
                    subTaskLabel = '';
                    break;
                case 2:
                    progress = 0;
                    subTaskLabel = '';
                case 0:
                    taskLabel = `Idle`;
                    break;
                default:
                    taskLabel = `Clearing caches...`;
                    break;
            }

            sendLogEntryCreate(window, {
                taskLabel: taskLabel,
                logLabel: logLabel,
                logLevel: logLevelFinal,
                subTaskLabel: subTaskLabel ?? logLabel,
            })
        }

        clearCaches(callback, true)
            .catch(
                ()=> {sendShowToast(undefined, { label: 'Не удалось очистить кеш' });}
            )
            .then(
                ()=> {sendShowToast(undefined, { label: 'Кеш очищен', duration: 2000 });}
            )


    })

}

export const sendShowToast = (window= mainWindow, args) => {
    window.webContents.send(Events.SHOW_TOAST, args);
    logger.log('Sent SHOW_TOAST', args);
}

export const sendPatchProgress = (window= mainWindow, args) => {
    window.webContents.send(Events.PATCH_PROGRESS, args);
    logger.log('Sent PATCH_PROGRESS', args);
}

export const sendLogEntryCreate = (window= mainWindow, args) => {
    window.webContents.send(Events.LOG_ENTRY_CREATE, args);
    logger.log('Sent LOG_ENTRY_CREATE', args);
}

export const sendIsModInstallPossible = (window= mainWindow, args) => {
    window.webContents.send(Events.IS_INSTALL_POSSIBLE_RESPONSE, args);
    logger.log('Sent IS_INSTALL_POSSIBLE_RESPONSE', args);
}

export const requestYmPath = (window= mainWindow, args) => {
    window.webContents.send(Events.REQUEST_YM_PATH, args);
    logger.log('Sent REQUEST_YM_PATH', args);
}

export const requestMacPermissions = (window= mainWindow, args) => {
    window.webContents.send(Events.REQUEST_MAC_PERMISSIONS, args);
    logger.log('Sent REQUEST_MAC_PERMISSIONS', args);
}

export const requestLegacyYmAppDeletion = (window= mainWindow, args) => {
    window.webContents.send(Events.REQUEST_LEGACY_YM_APP_DELETION, args);
    logger.log('Sent REQUEST_LEGACY_YM_APP_DELETION', args);
}

export const explorerDialogResponse = (window= mainWindow, args) => {
    window.webContents.send(Events.EXPLORER_DIALOG_RESPONSE, args);
    logger.log('Sent EXPLORER_DIALOG_RESPONSE', args);
}
export const sendStateUpdated = (window= mainWindow, state) => {
    window.webContents.send(Events.STATE_UPDATED, state);
    logger.log('Sent STATE_UPDATED', state);
}
export const sendStateInitiated = (window= mainWindow, state) => {
    window.webContents.send(Events.STATE_INITIATED, state);
    logger.log('Sent STATE_INITIATED', state);
}
export const sendModUpdateAvailable = (window= mainWindow, version) => {
    window.webContents.send(Events.MOD_UPDATE_AVAILABLE, version);
    logger.log('Sent MOD_UPDATE_AVAILABLE', version);
}
export const sendSelfUpdateAvailable = (window= mainWindow, version) => {
    window.webContents.send(Events.SELF_UPDATE_AVAILABLE, version);
    logger.log('Sent SELF_UPDATE_AVAILABLE', version);
}
export const sendYMUpdateAvailable = (window= mainWindow, version) => {
    window.webContents.send(Events.YM_UPDATE_AVAILABLE, version);
    logger.log('Sent YM_UPDATE_AVAILABLE', version);
}
export const sendModUpdateProgress = (window= mainWindow, version) => {
    window.webContents.send(Events.MOD_UPDATE_PROGRESS, version);
    logger.log('Sent MOD_UPDATE_PROGRESS', version);
}
export const sendSelfUpdateProgress = (window= mainWindow, version) => {
    window.webContents.send(Events.SELF_UPDATE_PROGRESS, version);
    logger.log('Sent SELF_UPDATE_PROGRESS', version);
}
export const sendYMUpdateProgress = (window= mainWindow, version) => {
    window.webContents.send(Events.YM_UPDATE_PROGRESS, version);
    logger.log('Sent YM_UPDATE_PROGRESS', version);
}
