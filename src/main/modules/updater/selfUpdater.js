import UpdateChecker from './UpdateChecker.js';
import path from 'path';
import { sendSelfUpdateAvailable, sendSelfUpdateProgress } from '../../events.js'
import { getState } from '../state.js';
import { EventEmitter } from 'events';
import Config from '../../config.js';
import { LATEST_SELF_RELEASE_URL } from '../../constants/urls.js';
import { SELF_UPDATER_TMP } from '../../constants/paths.js';
import { downloadFile, openExternalDetached } from "../utils.js";

import { Logger } from "../Logger.js";
import electron from 'electron';
import fsp from 'fs/promises';

const State = getState();
const selfVersion = Config.version;

class selfUpdater extends EventEmitter {
    constructor() {
        super();
        this.logger = new Logger('selfUpdater');
        this.logger.info('Initializing selfUpdater');
        this.downloadUrl = null;
        this.downloadFileName = null;
        this.updateChecker = new UpdateChecker('selfUpdater', LATEST_SELF_RELEASE_URL, selfVersion);
        this.updateChecker.on('updateAvailable', (version, downloadUrl) => { this.onUpdateAvailable(version, downloadUrl) })
        this.updateChecker.responseHandler = async (response) => {
            const releaseData = await response.json();
            this.downloadUrl = this.parseAssets(releaseData.assets);
            this.downloadFileName = this.downloadUrl.split('/').pop()
            return { version: releaseData.name, downloadUrl: this.downloadUrl };
        };


        this.on('ready', async () => {
            await this.clearCaches();
        })

        this.emit('ready');
        this.logger.info('selfUpdater initialized');
    }

    onUpdateAvailable(version, downloadUrl) {
        sendSelfUpdateAvailable(undefined, version);
        this.emit('updateAvailable', version, downloadUrl);
    }

    async installUpdate() {
        if (!this.downloadUrl) {
            return false;
        }
        const selfUpdaterTmpPath = path.join(SELF_UPDATER_TMP, this.downloadFileName);
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
        this.logger.info(`Progress: ${progress} ${label}`);
        sendSelfUpdateProgress(undefined, { progress, label });
    }

    parseAssets(assets) {
        const patterns = {
            win32: {
                x64: /\.Setup\.exe$/,
            },
            darwin: {
                arm64: /-arm64\.dmg$/,
                x64: /-x64\.dmg$/,
            },
            linux: {
                x64: /\.(deb|rpm)$/,
            },
        };

        const platformPatterns = patterns[process.platform] || {};
        const archPattern = platformPatterns[process.arch];
        if (!archPattern) return null;

        const asset = assets.find(a => archPattern.test(a.name));
        return asset ? asset.browser_download_url : null;
    }

    async clearCaches() {
        try {
            this.logger.info('ClearCaches: Clearing caches in: ', SELF_UPDATER_TMP);
            const files = await fsp.readdir(SELF_UPDATER_TMP, { withFileTypes: true });
            if (files.length === 0) return true;
            for (const file of files) {
                if (file.isDirectory()) {
                    continue;
                }
                const filePath = path.join(SELF_UPDATER_TMP, file.name);

                if (!filePath || !SELF_UPDATER_TMP || !file.name) return false;

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

export const getSelfUpdater = (() => {
    let selfUpdaterInstance;
    return () => {
        if (!selfUpdaterInstance) {
            selfUpdaterInstance = new selfUpdater();
        }
        return selfUpdaterInstance;
    };
})();
