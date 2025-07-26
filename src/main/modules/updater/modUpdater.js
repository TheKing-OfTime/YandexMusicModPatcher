import UpdateChecker from './UpdateChecker.js';
import { sendModUpdateAvailable } from '../../events.js'
import { getState } from '../state.js';
import { getInstalledYmMetadata } from '../utils.js';
import { EventEmitter } from 'events';
import electron from 'electron';
import { LATEST_MOD_RELEASE_URL } from '../../constants/urls.js';


const State = getState();
const ymMetadata = await getInstalledYmMetadata();

class modUpdater extends EventEmitter {
    constructor() {
        super();
        this.updateChecker = new UpdateChecker('modUpdater', LATEST_MOD_RELEASE_URL, ymMetadata.modification?.version);
        this.updateChecker.responseHandler = async (response) => {
            const releaseData = await response.json();
            return { version: releaseData.name };
        };
        this.updateChecker.on('updateAvailable', (version, downloadUrl) => { this.onUpdateAvailable(version, downloadUrl) })
    }

    onUpdateAvailable(version, downloadUrl) {
        sendModUpdateAvailable(undefined, version);
        this.emit('updateAvailable', version, downloadUrl);
    }

    installUpdate() {
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
