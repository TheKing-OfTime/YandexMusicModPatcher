import UpdateChecker from './UpdateChecker.js';
import { sendModUpdateAvailable } from '../../events.js'
import { getState } from '../state.js';
import { getInstalledYmMetadata } from '../utils.js';
import { EventEmitter } from 'events';
import electron from 'electron';


const State = getState();
const ymMetadata = await getInstalledYmMetadata();

export class modUpdater extends EventEmitter {
    constructor() {
        super();
        this.updateChecker = new UpdateChecker('modUpdater', 'https://api.github.com/repos/TheKing-OfTime/YandexMusicModClient/releases/latest', ymMetadata.modification?.version);
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
