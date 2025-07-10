import electron from "electron";
import { checkIsDeeplink, navigateToDeeplink } from "./handleDeeplinks.js";
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
                if (lastCommandLineArg && checkIsDeeplink(lastCommandLineArg)
                ) {
                    navigateToDeeplink(lastCommandLineArg, window);
                }
            }
        });
    } else {
        electron.app.quit();
    }
};
