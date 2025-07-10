import electron from "electron";
import { handleDeeplink } from "./handleDeeplinks.js";
const isFirstInstance = electron.app.requestSingleInstanceLock();
export const checkForSingleInstance = () => {
    if (isFirstInstance) {
        electron.app.on("second-instance", (event, commandLine) => {
            const [window] = electron.BrowserWindow.getAllWindows();
            if (window) {
                if (window.isMinimized()) {
                    window.restore();
                }
                window.focus();
                const lastCommandLineArg = commandLine.pop();
                if (lastCommandLineArg && handleDeeplink.checkIsDeeplink(lastCommandLineArg)
                ) {
                    handleDeeplink.navigateToDeeplink(window, lastCommandLineArg);
                }
            }
        });
    } else {
        electron.app.quit();
    }
};
