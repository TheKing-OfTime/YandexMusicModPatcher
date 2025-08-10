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

const State = getState();
const logger = new Logger('selfUpdater');
const selfVersion = Config.version;

class selfUpdater extends EventEmitter {
    constructor() {
        super();
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
