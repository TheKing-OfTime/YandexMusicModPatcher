import UpdateChecker from './UpdateChecker.js';
import path from 'path';
import { sendYMUpdateAvailable, sendYMUpdateProgress } from '../../events.js'
import { getState } from '../state.js';
import { getInstalledYmMetadata } from '../utils.js';
import { EventEmitter } from 'events';
import * as yaml from 'yaml'
import { YM_RELEASE_METADATA_URL, YM_SETUP_DOWNLOAD_URLS } from '../../constants/urls.js';
import { YM_UPDATER_TMP } from '../../constants/paths.js';
import { downloadFile, openExternalDetached } from "../utils.js";

import { Logger } from "../Logger.js";
import electron from 'electron';

const State = getState();
const ymMetadata = await getInstalledYmMetadata();

class ymUpdater extends EventEmitter {
    constructor() {
        super();
        this.downloadUrl = null;
        this.downloadFileName = null;
        this.updateChecker = new UpdateChecker('ymUpdater', YM_RELEASE_METADATA_URL, ymMetadata.buildInfo?.version);
        this.updateChecker.on('updateAvailable', (version, downloadUrl) => { this.onUpdateAvailable(version, downloadUrl) })
        this.updateChecker.responseHandler = async (response) => {
            const releaseText = await response.text();
            const releaseData = yaml.parse(releaseText);
            this.downloadUrl = this.getDownloadUrl(releaseData);
            this.downloadFileName = this.downloadUrl.split('/').pop()
            return { version: releaseData.version, downloadUrl: this.downloadUrl };
        };
    }

    onUpdateAvailable(version, downloadUrl) {
        sendYMUpdateAvailable(undefined, version);
        this.emit('updateAvailable', version, downloadUrl);
    }

    async installUpdate() {
        if (!this.downloadUrl) {
            return false;
        }
        const selfUpdaterTmpPath = path.join(YM_UPDATER_TMP, this.downloadFileName);
        this.onProgress(0, 'Installing update...');
        try {
            await downloadFile(this.downloadUrl, selfUpdaterTmpPath, this.onProgress);
        } catch (error) {
            this.onProgress(-1, 'Download error: ' + error.message + error.stack + error.cause);
            return false;
        }
        this.onProgress(1, 'Downloaded. Installing...');

        this.emit('updateInstall', selfUpdaterTmpPath);
        this.onProgress(1, 'Restarting...');
        openExternalDetached(selfUpdaterTmpPath);
        this.emit('updateInstallAppQuit');
        setTimeout(() => { electron.app.quit() }, 100);

    }

    onProgress(progress, label) {
        this.emit('progress', progress, label);
        sendYMUpdateProgress(undefined, { progress, label });
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
