import electron from "electron";
import {installMod, getReleaseMetadata, isInstallPossible, updatePaths} from "./patcher.js";

/**
 *
 * @param window {electron.BrowserWindow}
 */
export const handleApplicationEvents = (window) => {
    electron.ipcMain.on('QUIT', ()=>{
        electron.app.quit();
    });
    electron.ipcMain.on('RESTART', ()=>{
        electron.app.relaunch();
        electron.app.quit();
    });
    electron.ipcMain.on('MINIMIZE', ()=>{
        window.minimize();
    });
    electron.ipcMain.on('MAXIMIZE', ()=>{
        window.maximize();
    });
    electron.ipcMain.on('PATCH', async () => {
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
    electron.ipcMain.on('IS_INSTALL_POSSIBLE', async () => {
        const callback = (progress, logLabel) => {
            sendPatchProgress(window, {
                progress: 0,
                taskLabel: `Checking if install possible...`,
                logLabel: logLabel,
            })
        }

        const isPossible = isInstallPossible(callback);
        sendPatchProgress(window, {
            progress: 0,
            taskLabel: `Idle`,
            logLabel: '',
        })

        sendIsModInstallPossible(window, {isPossible: isPossible.status});

    });

    electron.ipcMain.on('UPDATE_YM_PATH', async (event, args) => {
        updatePaths(args.ymPath)
    })
}

export const sendPatchProgress = (window, args) => {
    window.webContents.send('PATCH_PROGRESS', args);
}

export const sendIsModInstallPossible = (window, args) => {
    window.webContents.send('IS_INSTALL_POSSIBLE_RESPONSE', args);
}

export const requestYmPath = (window, args) => {
    window.webContents.send('REQUEST_YM_PATH', args);
}