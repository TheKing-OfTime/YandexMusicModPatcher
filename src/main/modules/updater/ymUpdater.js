import UpdateChecker from './UpdateChecker.js';
import { sendModUpdateAvailable } from '../../events.js'
import { getState } from '../state.js';
import { getInstalledYmMetadata } from '../utils.js';
import { EventEmitter } from 'events';
import * as yaml from 'yaml'
import electron from 'electron';
import { YM_RELEASE_METADATA_URL, YM_SETUP_DOWNLOAD_URLS } from '../../constants/urls.js';


const State = getState();
const ymMetadata = await getInstalledYmMetadata();

class ymUpdater extends EventEmitter {
    constructor() {
        super();
        this.updateChecker = new UpdateChecker('ymUpdater', YM_RELEASE_METADATA_URL, ymMetadata.buildInfo?.version);
        this.updateChecker.on('updateAvailable', (version, downloadUrl) => { this.onUpdateAvailable(version, downloadUrl) })
        this.updateChecker.responseHandler = async (response) => {
            const releaseText = await response.text();
            const releaseData = yaml.parse(releaseText);
            return { version: releaseData.version, downloadUrl: this.getDownloadUrl(releaseData) };
        };
    }

    onUpdateAvailable(version, downloadUrl) {
        sendModUpdateAvailable(undefined, version);
        this.emit('updateAvailable', version, downloadUrl);
    }

    installUpdate() {

    }

    getDownloadUrl(releaseData) {
        const url = YM_SETUP_DOWNLOAD_URLS[process.platform]?.replace('1.0.0', releaseData.version);
        if (!url) return null;
        return url;
    }
}

export const getYmUpdater = (() => {
    let ymUpdaterInstance;
    return () => {
        if (!ymUpdaterInstance) {
            ymUpdaterInstance = new ymUpdater();
        }
        return ymUpdaterInstance;
    };
})();
