import Updater from './Updater.js';
import { sendModUpdateAvailable } from '../../events.js'
import { getState } from '../state.js';

const State = getState();

export class modUpdater extends Updater {
    constructor() {
        super(
            'modUpdater',
            'https://api.github.com/repos/TheKing-OfTime/YandexMusicModClient/releases/latest',
            async (response) => {
                const releaseData = await response.json();
                return { version: releaseData.name, downloadUrl: undefined };
            },
            ({ version }) => {
                sendModUpdateAvailable(version);
            },
            (...args) => {}
        );
        this.installedVersion = State.get('lastPatchInfo.modVersion');
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
