import deeplinkCommands from './deeplinkCommands/index.js';
import electron from 'electron';
import config from '../config.js';
import { Logger } from "./Logger.js";
const logger = new Logger("deeplinks");


const transformUrl = (url) => {
    return url.replace(`${config.deeplinkProtocol}://`, "").split('/');
};

const deeplinkCommandsHandler = await new deeplinkCommands();

export const checkIsDeeplink = (value) => {
    const deeplinkRegexp = new RegExp(`${config.deeplinkProtocol}:\/\/.*`);
    return deeplinkRegexp.test(value);
};
export const navigateToDeeplink = (url, window=undefined) => {
    if (!url) {
        return;
    }
    const args = transformUrl(url);
    window?.focus();

    if (args) {
        const commandName = args.shift();
        deeplinkCommandsHandler.runCommand(commandName, args, window);
    }

};
export const handleDeeplinkOnApplicationStartup = () => {
    const lastArgFromProcessArgs = process.argv.pop();
    if (lastArgFromProcessArgs && checkIsDeeplink(lastArgFromProcessArgs)) {
        navigateToDeeplink(lastArgFromProcessArgs);
    }
};
export const handleDeeplink = (window) => {
    electron.app.on("open-url", (event, url) => {
        event.preventDefault();
        logger.log('Deeplink received:', url);
        navigateToDeeplink(url, window);
    });
};
