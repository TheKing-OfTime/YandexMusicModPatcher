import UpdateChecker from './UpdateChecker.js';
import { sendModUpdateAvailable, sendModUpdateUpToDate, sendModUpdateProgress, sendModUpdateCheckStarted, sendModUpdateCheckFailed } from '../../events.js'
import { getState } from '../state.js';
import { getInstalledYmMetadata } from '../utils.js';
import { EventEmitter } from 'events';
import electron from 'electron';
import { LATEST_MOD_RELEASE_URL } from '../../constants/urls.js';
import { Logger } from "../Logger.js";


const State = getState();
const ymMetadata = await getInstalledYmMetadata();

class modUpdater extends EventEmitter {
    constructor() {
        super();
        this.logger = new Logger('modUpdater');
        this.logger.info('Initializing modUpdater');
        this.newVersion = null;
        this.updateChecker = new UpdateChecker('modUpdater', LATEST_MOD_RELEASE_URL, ymMetadata.modification?.version);
        this.updateChecker.responseHandler = async (response) => {
            const releaseData = await response.json();
            return { version: releaseData.name };
        };
        this.updateChecker.on('updateAvailable', (version, downloadUrl) => { this.onUpdateAvailable(version, downloadUrl) })
        this.updateChecker.on('noUpdatesAvailable', (version) => { this.onNoUpdatesAvailable(version) })
        this.updateChecker.on('checkStarted', () => { this.onCheckStarted() })
        this.updateChecker.on('updateCheckFailed', (error) => { this.onCheckFailed(error) })
    }

    onUpdateAvailable(version, downloadUrl) {
        this.newVersion = version;
        sendModUpdateAvailable(undefined, ymMetadata.modification?.version, version);
        this.emit('updateAvailable', version, downloadUrl);
    }

    onNoUpdatesAvailable(version) {
        sendModUpdateUpToDate(undefined, version);
        this.emit('noUpdatesAvailable', version);
    }

    onCheckStarted() {
        sendModUpdateCheckStarted(undefined);
        this.emit('checkStarted');
    }

    onCheckFailed(error) {
        sendModUpdateCheckFailed(undefined, error);
        this.emit('checkFailed', error);
    }

    onProgress(progress, label) {
        this.emit('progress', progress, label);
        this.logger.info(`Progress: ${progress} ${label}`);
        sendModUpdateProgress(undefined, { progress, label });
    }

    installUpdate() {
        this.onProgress(0, 'Installing mod update...');
        electron.ipcMain.emit('PATCH', { patchType: State.get('patchType') || 'default' })
    }
}

export const getModUpdater = (() => {
    let modUpdaterInstance;
    return () => {
        if (!modUpdaterInstance) {
            modUpdaterInstance = new modUpdater();
        }
        return modUpdaterInstance;
    };
})();
