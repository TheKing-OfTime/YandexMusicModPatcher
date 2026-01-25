import semver from 'semver';
import { EventEmitter } from 'events';
import { Logger } from "../Logger.js";

const logger = new Logger("UpdateChecker");

export default class UpdateChecker extends EventEmitter {

    /**
     * @param name {string} Name of the updater, used for logging
     * @param feedUrl {string} URL of the update feed
     * @param installedVersion {string} Version of the currently installed version
     * @param responseHandler {function(Response):Promise<{version: string, downloadUrl: string}>} Function to handle the response from the update feed.
     */
    constructor(name, feedUrl, installedVersion, responseHandler=undefined) {
        super();
        this.name = name;
        this.installedVersion = installedVersion;
        this.latestVersion = null;
        this.updateAvailable = false;
        this.feedUrl = feedUrl;
        this.responseHandler = responseHandler;
        this.intervalId = null;
    }

    async checkForUpdates(force = false) {
        this.emit('checkStarted');

        const response = await fetch(this.feedUrl);
        if (!response.ok) {
            logger.warn('Update check failed. Updater:', this.name, 'Response:', response.status, response.statusText, await response.text());
            this.emit('updateCheckFailed', { errorCode: 'FETCH_FAILED', errorMessage: `${response.status} ${response.statusText}` });
            return false;
        }

        const { version, downloadUrl } = await this.responseHandler(response);

        if (!version) {
            logger.warn('Update check failed. Updater:', this.name, 'Response handler did not return a version.');
            this.emit('updateCheckFailed', { errorCode: 'PARSE_ERROR', errorMessage: 'Failed to parse response' });
            return false;
        }

        if(!(force || (this.installedVersion && semver.lt(this.installedVersion, version )))) {
            logger.debug('No updates available for', this.name, 'version:', this.installedVersion, 'is up to date');
            this.emit('noUpdatesAvailable', this.installedVersion);
            return false;
        }

        this.latestVersion = version;
        this.updateAvailable = true;

        this.emit('updateAvailable', version, downloadUrl);

        return { version, downloadUrl };
    }


    /**
     * Starts a loop that checks for updates every `interval` milliseconds.
     * @param interval
     */
    async startCheckerLoop(interval = 1000 * 60 * 60) {
        if (!this.intervalId) {

            await this.checkForUpdates();

            this.intervalId = setInterval(async () => {
                await this.checkForUpdates();
            }, interval);
        } else {
            logger.warn('Second update loop start try:', this.name);
        }
    }

    stopCheckerLoop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        } else {
            logger.warn('Update loop stop request while no active loop:', this.name);
        }
    }
}
