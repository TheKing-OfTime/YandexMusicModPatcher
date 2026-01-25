import UpdateChecker from './UpdateChecker.js';
import path from 'path';
import { sendYMUpdateAvailable, sendYMUpdateUpToDate, sendYMUpdateProgress, sendYMUpdateCheckStarted, sendYMUpdateCheckFailed } from '../../events.js'
import { getState } from '../state.js';
import { getInstalledYmMetadata } from '../utils.js';
import { EventEmitter } from 'events';
import * as yaml from 'yaml'
import { YM_RELEASE_METADATA_URL, YM_SETUP_DOWNLOAD_URLS } from '../../constants/urls.js';
import { YM_UPDATER_TMP } from '../../constants/paths.js';
import { downloadFile, openExternalDetached } from "../utils.js";
import fsp from 'fs/promises';

import { Logger } from "../Logger.js";
import electron from 'electron';
import fs from 'fs';

const State = getState();
const ymMetadata = await getInstalledYmMetadata();

class ymUpdater extends EventEmitter {
    constructor() {
        super();
        this.logger = new Logger('ymUpdater');
        this.logger.info('Initializing ymUpdater');
        this.downloadUrl = null;
        this.downloadFileName = null;
        this.newVersion = null;
        this.updateChecker = new UpdateChecker('ymUpdater', YM_RELEASE_METADATA_URL, ymMetadata.version);
        this.updateChecker.on('updateAvailable', (version, downloadUrl) => { this.onUpdateAvailable(version, downloadUrl) })
        this.updateChecker.on('noUpdatesAvailable', (version) => { this.onNoUpdatesAvailable(version) })
        this.updateChecker.on('checkStarted', () => { this.onCheckStarted() })
        this.updateChecker.on('updateCheckFailed', (error) => { this.onCheckFailed(error) })
        this.updateChecker.responseHandler = async (response) => {
            const releaseText = await response.text();
            const releaseData = yaml.parse(releaseText);
            this.downloadUrl = this.getDownloadUrl(releaseData);
            this.downloadFileName = this.downloadUrl.split('/').pop()
            return { version: releaseData.version, downloadUrl: this.downloadUrl };
        };

        this.on('ready', async () => {
            await this.clearCaches();
        })

        this.emit('ready');
        this.logger.info('ymUpdater initialized');
    }

    onUpdateAvailable(version, downloadUrl) {
        this.newVersion = version;
        sendYMUpdateAvailable(undefined, ymMetadata.buildInfo?.version, version);
        this.emit('updateAvailable', version, downloadUrl);
    }

    onNoUpdatesAvailable(version) {
        sendYMUpdateUpToDate(undefined, version);
        this.emit('noUpdatesAvailable', version);
    }

    onCheckStarted() {
        sendYMUpdateCheckStarted(undefined);
        this.emit('checkStarted');
    }

    onCheckFailed(error) {
        sendYMUpdateCheckFailed(undefined, error);
        this.emit('checkFailed', error);
    }

    async installUpdate() {
        if (!this.downloadUrl) {
            return false;
        }
        const ymUpdaterTmpPath = path.join(YM_UPDATER_TMP, this.downloadFileName);
        this.onProgress(0, 'Installing update...');
        try {
            await downloadFile(this.downloadUrl, ymUpdaterTmpPath, this.onProgress);
        } catch (error) {
            this.onProgress(-1, 'Download error: ' + error.message + error.stack + error.cause);
            return false;
        }
        this.onProgress(1, 'Downloaded. Installing...');

        this.emit('updateInstall', ymUpdaterTmpPath);
        openExternalDetached(ymUpdaterTmpPath);
    }

    onProgress(progress, label) {
        this.emit('progress', progress, label);
        this.logger.info(`Progress: ${progress} ${label}`);
        sendYMUpdateProgress(undefined, { progress, label });
    }

    getDownloadUrl(releaseData) {
        const url = YM_SETUP_DOWNLOAD_URLS[process.platform]?.replace('1.0.0', releaseData.version);
        if (!url) return null;
        return url;
    }

    async clearCaches() {
        try {
            if (!fs.existsSync(this.YM_UPDATER_TMP)) return;
            this.logger.info('ClearCaches: Clearing caches in: ', YM_UPDATER_TMP);
            const files = await fsp.readdir(YM_UPDATER_TMP, { withFileTypes: true });
            if (files.length === 0) return true;
            for (const file of files) {
                if (file.isDirectory()) {
                    continue;
                }
                const filePath = path.join(YM_UPDATER_TMP, file.name);

                if (!filePath || !YM_UPDATER_TMP || !file.name) return false;

                await fsp.unlink(filePath);
                this.logger.info('ClearCaches: ', 'Cleared cache at:', filePath);
            }
            this.logger.info('ClearCaches: Caches cleared successfully');
        } catch (err) {
            this.logger.error('ClearCaches: ', 'Error clearing caches:', err);
            return false;
        }
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
