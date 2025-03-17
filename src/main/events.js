import electron from "electron";
import installMod from "./patcher.js";

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
        const callback = (progress, logLabel) => {
            sendPatchProgress(window, {
                progress: progress,
                taskLabel: 'Installing YandexMusicModClient...',
                logLabel: logLabel,
            })
        }
        await installMod(callback);

    });
}

export const sendPatchProgress = (window, args) => {
    window.webContents.send('PATCH_PROGRESS', args);
}
