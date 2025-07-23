import semver from 'semver';
import path from 'path';

import { downloadFile } from '../utils.js';
import { TMP_PATH } from '../../constants/paths.js';
import { Logger } from "../Logger.js";

const logger = new Logger("Updater");

export default class Updater {

    /**
     * @param name {string} Name of the updater, used for logging
     * @param feedUrl {string} URL of the update feed
     * @param responseHandler {function(Response):Promise<{version: string, downloadUrl: string}>} Function to handle the response from the update feed.
     * @param onUpdateAvailableHandler {function({version: string, downloadUrl: string}):Promise<void>} Function to call when an update is available.
     * @param onUpdateProgressHandler {function(progress:number, logText:string, subTaskText:string):void} Function to call while update progress. Optional.
     */
    constructor(name, feedUrl, responseHandler, onUpdateAvailableHandler, onUpdateProgressHandler=undefined) {
        this.name = name;
        this.tmpPath = path.join(TMP_PATH, 'Updaters', name);
        this.installedVersion = null;
        this.downloadededVersion = null;
        this.latestVersion = null;
        this.updateAvailable = false;
        this.feedUrl = feedUrl;
        this.responseHandler = responseHandler;
        this.onUpdateAvailableHandler = onUpdateAvailableHandler;
        this.onUpdateProgressHandler = onUpdateProgressHandler;
        this.intervalId = null;
    }

    async checkForUpdates(force = false) {
        const response = await fetch(this.feedUrl);
        if (!response.ok) {
            logger.warn('Update check failed. Updater:', name, 'Response:', response.status, response.statusText, await response.text());
            return false;
        }

        const { version, downloadUrl } = await this.responseHandler(response);

        if (!version) {
            logger.warn('Update check failed. Updater:', this.name, 'Response handler did not return a version.');
            return false;
        }

        if(!(force || (this.installedVersion && semver.lt(this.installedVersion, version )))) {
            logger.debug('No updates available for', this.name, 'version:', this.installedVersion, 'is up to date');
            return false;
        }

        this.latestVersion = version;
        this.updateAvailable = true;

        await this.onUpdateAvailableHandler({ version, downloadUrl });

        return { version, downloadUrl };
    }

    /**
     * Downloads the update from the given URL.
     * @param downloadUrl
     * @returns {Promise<string|void>} The path to the downloaded file, or undefined if the download failed.
     */
    async downloadUpdate(downloadUrl) {
        if (!downloadUrl) {
            return logger.error('Updater:', this.name, 'No download URL provided for update.');
        }

        logger.debug('Updater:', this.name, 'Downloading update from:', downloadUrl);

        const downloadedPath = await downloadFile(downloadUrl, path.join(this.tmpPath, downloadUrl.split('/').pop()), this.onUpdateProgressHandler);

        if (!downloadedPath) {
            throw new Error('Failed to download update from ' + downloadUrl);
        }

        this.downloadededVersion = this.latestVersion;
        logger.debug('Update downloaded successfully:', this.name, 'version:', this.downloadededVersion, 'to path:', downloadedPath);

        return downloadedPath;
    }

    /**
     * Starts a loop that checks for updates every `interval` milliseconds.
     * @param interval
     */
    async startCheckerLoop(interval = 1000 * 60 * 60) {
        if (!this.intervalId) {

            await this.checkForUpdates();

            setInterval(async () => {
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
