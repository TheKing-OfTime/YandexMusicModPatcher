import electron from "electron";
import { installMod, getReleaseMetadata } from "./patcher.js";

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

        const metadata = await getReleaseMetadata();
        const version = metadata.name;


        const callback = (progress, logLabel) => {
            sendPatchProgress(window, {
                progress: progress,
                taskLabel: `Installing YandexMusicModClient ${version}...`,
                logLabel: logLabel,
            })
        }

        await installMod(callback);
        sendPatchProgress(window, {
            progress: 0,
            taskLabel: `YandexMusicModClient ${version} installed`,
            logLabel: '',
        })
    });
}

export const sendPatchProgress = (window, args) => {
    window.webContents.send('PATCH_PROGRESS', args);
}
