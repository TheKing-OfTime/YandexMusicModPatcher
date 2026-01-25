import Events from "../../main/types/Events.js";


window.EventList = Events;

export function useSendPatch() {
    return window.desktopEvents.send(Events.PATCH);
}

export function useSendDepatch() {
    return window.desktopEvents.send(Events.DEPATCH);
}

export function useSendIsInstallPossible() {
    return window.desktopEvents.send(Events.IS_INSTALL_POSSIBLE);
}

export function useSendReady(payload = {}) {
    return window.desktopEvents.send(Events.READY, payload);
}

export function useSendInit(payload = {}) {
    return window.desktopEvents.send(Events.INIT, payload);
}

export function useSendSetCustomYmPath(payload) {
    return window.desktopEvents.send(Events.SET_CUSTOM_YM_PATH, payload);
}

export function useSendOpenExplorerDialog() {
    return window.desktopEvents.send(Events.OPEN_EXPLORER_DIALOG);
}

export function useSendOpenExternalPermissionsSettings() {
    return window.desktopEvents.send(Events.OPEN_EXTERNAL_PERMISSIONS_SETTINGS);
}

export function useSendUpdateState(payload) {
    return window.desktopEvents.send(Events.UPDATE_STATE, payload);
}

export function useSendQuit() {
    return window.desktopEvents.send(Events.QUIT);
}

export function useSendMinimize() {
    return window.desktopEvents.send(Events.MINIMIZE);
}

export function useSendMaximize() {
    return window.desktopEvents.send(Events.MAXIMIZE);
}

export function useSendDeleteLegacyYmApp() {
    return window.desktopEvents.send(Events.DELETE_LEGACY_YM_APP);
}

export function useSendReadyToPatch() {
    return window.desktopEvents.send(Events.READY_TO_PATCH);
}

export function useSendClearCaches() {
    return window.desktopEvents.send(Events.CLEAR_CACHES);
}

export function useOnPatchProgress(callback) {
    return window.desktopEvents.on(Events.PATCH_PROGRESS, (event, args) => {
        callback(event, args)
    })
}

export function useOnIsInstallPossibleResponse(callback) {
    return window.desktopEvents.on(Events.IS_INSTALL_POSSIBLE_RESPONSE, (event, args) => {
        callback(event, args);
    });
}

export function useOnRequestYmPath(callback) {
    return window.desktopEvents.on(Events.REQUEST_YM_PATH, (event, args) => {
        callback(event, args);
    });
}

export function useOnExplorerDialogResponse(callback) {
    return window.desktopEvents.on(Events.EXPLORER_DIALOG_RESPONSE, (event, args) => {
        callback(event, args);
    });
}

export function useOnRequestMacPermissions(callback) {
    return window.desktopEvents.on(Events.REQUEST_MAC_PERMISSIONS, (event, args) => {
        callback(event, args);
    });
}

export function useOnLogEntryCreate(callback) {
    return window.desktopEvents.on(Events.LOG_ENTRY_CREATE, (event, args) => {
        callback(event, args);
    });
}

export function useOnStateUpdated(callback) {
    return window.desktopEvents.on(Events.STATE_UPDATED, (event, args) => {
        callback(event, args);
    });
}

export function useOnStateInitiated(callback) {
    return window.desktopEvents.on(Events.STATE_INITIATED, (event, args) => {
        callback(event, args);
    });
}

export function useOnRequestLegacyYmAppDeletion(callback) {
    return window.desktopEvents.on(Events.REQUEST_LEGACY_YM_APP_DELETION, (event, args) => {
        callback(event, args);
    });
}

export function useOnShowToast(callback) {
    return window.desktopEvents.on(Events.SHOW_TOAST, (event, args) => {
        callback(event, args);
    });
}

export function useSendInstallAllUpdates() {
    return window.desktopEvents.send(Events.INSTALL_ALL_UPDATES);
}

export function useSendInstallSelfUpdate() {
    return window.desktopEvents.send(Events.INSTALL_SELF_UPDATE);
}

export function useOnModUpdaterStatus(callback) {
    return window.desktopEvents.on(Events.MOD_UPDATER_STATUS, (event, args) => {
        callback(event, args);
    });
}

export function useOnYMUpdaterStatus(callback) {
    return window.desktopEvents.on(Events.YM_UPDATER_STATUS, (event, args) => {
        callback(event, args);
    });
}

export function useOnSelfUpdaterStatus(callback) {
    return window.desktopEvents.on(Events.SELF_UPDATER_STATUS, (event, args) => {
        callback(event, args);
    });
}

export function useOnModUpdateProgress(callback) {
    return window.desktopEvents.on(Events.MOD_UPDATE_PROGRESS, (event, args) => {
        callback(event, args);
    });
}

export function useOnYMUpdateProgress(callback) {
    return window.desktopEvents.on(Events.YM_UPDATE_PROGRESS, (event, args) => {
        callback(event, args);
    });
}

export function useOnSelfUpdateProgress(callback) {
    return window.desktopEvents.on(Events.SELF_UPDATE_PROGRESS, (event, args) => {
        callback(event, args);
    });
}

export function useOnModUpdaterCheckStarted(callback) {
    return window.desktopEvents.on(Events.MOD_UPDATER_STATUS, (event, args) => {
        if (args.isChecking) callback(event, args);
    });
}

export function useOnYMUpdaterCheckStarted(callback) {
    return window.desktopEvents.on(Events.YM_UPDATER_STATUS, (event, args) => {
        if (args.isChecking) callback(event, args);
    });
}

export function useOnSelfUpdaterCheckStarted(callback) {
    return window.desktopEvents.on(Events.SELF_UPDATER_STATUS, (event, args) => {
        if (args.isChecking) callback(event, args);
    });
}

export function useOnModUpdaterCheckFailed(callback) {
    return window.desktopEvents.on(Events.MOD_UPDATER_STATUS, (event, args) => {
        if (args.isCheckFailed) callback(event, args);
    });
}

export function useOnYMUpdaterCheckFailed(callback) {
    return window.desktopEvents.on(Events.YM_UPDATER_STATUS, (event, args) => {
        if (args.isCheckFailed) callback(event, args);
    });
}

export function useOnSelfUpdaterCheckFailed(callback) {
    return window.desktopEvents.on(Events.SELF_UPDATER_STATUS, (event, args) => {
        if (args.isCheckFailed) callback(event, args);
    });
}
