export default class Updater {

    /**
     * @param name {string} Name of the updater, used for logging
     * @param feedUrl {string} URL of the update feed
     * @param responseHandler {function} Function to handle the response from the update feed. It should accept a single parameter which is the response data. And return a string containing the received version.
     */
    constructor(name, feedUrl, responseHandler) {
        this.name = name;
        this.installedVersion = null;
        this.downloadededVersion = null;
        this.updateAvailable = false;
        this.feedUrl = feedUrl;
        this.responseHandler = responseHandler;
    }

    async checkForUpdates() {
        const response = await fetch(this.feedUrl);
        if (!response.ok) {
            console.warn('Update check failed. Updater:', name, 'Response:', response.status, response.statusText, await response.text());
            return false;
        }

        const version = await this.responseHandler(response);

        if (!version) {
            console.warn('Update check failed. Updater:', this.name, 'Response handler did not return a version.');
            return false;
        }

        //TODO: Complete basic updater
    }
}
