import UpdateChecker from './UpdateChecker.js';
import { sendSelfUpdateAvailable } from '../../events.js'
import { getState } from '../state.js';
import { getInstalledYmMetadata } from '../utils.js';
import { EventEmitter } from 'events';
import Config from '../../config.js';
import { LATEST_SELF_RELEASE_URL } from '../../constants/urls.js';


const State = getState();
const selfVersion = Config.version;

class selfUpdater extends EventEmitter {
    constructor() {
        super();
        this.updateChecker = new UpdateChecker('selfUpdater', LATEST_SELF_RELEASE_URL, selfVersion);
        this.updateChecker.on('updateAvailable', (version, downloadUrl) => { this.onUpdateAvailable(version, downloadUrl) })
        this.updateChecker.responseHandler = async (response) => {
            const releaseData = await response.json();
            return { version: releaseData.name, downloadUrl: this.parseAssets(releaseData.assets) };
        };
    }

    onUpdateAvailable(version, downloadUrl) {
        sendSelfUpdateAvailable(undefined, version);
        this.emit('updateAvailable', version, downloadUrl);
    }

    installUpdate() {

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
