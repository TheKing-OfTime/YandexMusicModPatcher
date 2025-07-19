import path from "path";
import { promisify } from "util";
import os from "os";
import crypto from "crypto";
import * as fso from 'original-fs';
import yaml from 'js-yaml';
import * as zlib from "node:zlib";
import * as fs from 'fs';
import * as fsp from 'fs/promises'
import { execSync } from "child_process";
import asar from '@electron/asar';
import plist from 'plist';
import { getState } from "./state.js";
import Events from "../types/Events.js";
import PatchTypes from '../types/PatchTypes.js';
import { ASAR_GZ_TMP_PATH, ASAR_TMP_PATH, EXTRACTED_ENTITLEMENTS_PATH, TMP_PATH, ASAR_TMP_BACKUP_PATH, YM_EXE_TMP_BACKUP_PATH } from '../constants/paths.js';
import { Logger } from "./Logger.js";

import {
    checkIfLegacyYMInstalled,
    closeYandexMusic,
    downloadFile,
    isLinux,
    isMac,
    isWin,
    isYandexMusicRunning,
    launchYandexMusic
} from "./utils.js";
import { LATEST_RELEASE_URL, YM_RELEASE_METADATA_URL } from '../constants/urls.js';


const State = getState();
const logger = new Logger("patcher");

const unzipPromise = promisify(zlib.unzip);

const DEFAULT_YM_PATH = {
    darwin: path.join('/Applications', 'Яндекс Музыка.app'),
    linux: '',
    win32: path.join(process?.env?.LOCALAPPDATA ?? '' , 'Programs', 'YandexMusic'),
}

const resolveAsarPath = (appPath, platform) => {
    if (platform === 'darwin') {
        return path.join(appPath, 'Contents', 'Resources', 'app.asar');
    } else if (platform === 'win32') {
        return path.join(appPath, 'resources', 'app.asar');
    } else if (platform === 'linux') {
        return path.join(appPath, 'resources', 'app.asar');
    }
}

let YM_PATH = DEFAULT_YM_PATH[os.platform];
let INFO_PLIST_PATH = path.join(YM_PATH, 'Contents', 'Info.plist');
let YM_ASAR_PATH = resolveAsarPath(YM_PATH, os.platform());
let YM_EXE_PATH = undefined;

export const updatePaths = (ymPath) => {
    YM_PATH = ymPath;
    INFO_PLIST_PATH = path.join(YM_PATH, 'Contents', 'Info.plist');
    YM_ASAR_PATH = resolveAsarPath(YM_PATH, os.platform());
}

let oldYMHash;

let shouldDecompress = false;
let modVersion = undefined;

await createDirIfNotExist(TMP_PATH);

async function clearCaches(callback) {
    callback(1, 'Clearing caches...');
    if (fs.existsSync(ASAR_TMP_BACKUP_PATH)) await fsp.unlink(ASAR_TMP_BACKUP_PATH);
    if (fs.existsSync(YM_EXE_TMP_BACKUP_PATH)) await fsp.unlink(YM_EXE_TMP_BACKUP_PATH);
    if (fs.existsSync(EXTRACTED_ENTITLEMENTS_PATH)) await fsp.unlink(EXTRACTED_ENTITLEMENTS_PATH);
    callback(1, 'Caches cleared.');
}

async function postInstallTasks(ymMetadata, wasYmClosed, callback) {
    State.set('lastPatchInfo', {
        modVersion: modVersion,
        ymVersion: ymMetadata.version,
        patchType: State.get('patchType'),
        date: new Date().toISOString(),
    });
    logger.log(State.get('lastPatchInfo'));

    if (!(await isYandexMusicRunning()) && wasYmClosed) {
        callback(1, 'Yandex Music was closed while mod install. Launching it...', 'Launching Yandex Music...');
        try {
            launchYandexMusic();
            setTimeout(() => callback(2, 'Yandex Music launched.'), 500);
        } catch (e) {
            callback(-1, 'Failed to launch Yandex Music: ' + e.message);
        }
    }
}

async function applyBackups(callback, asarPath) {

    callback(-1, 'Reverting ASAR replace...');
    await copyFile(ASAR_TMP_BACKUP_PATH, asarPath);
    callback(-1, 'ASAR replace reverted.');

    if (isWin && YM_EXE_PATH && fs.existsSync(YM_EXE_PATH) && fs.existsSync(YM_EXE_TMP_BACKUP_PATH)) {
        callback(-1, 'Reverting EXE patch...');
        await copyFile(YM_EXE_TMP_BACKUP_PATH, YM_EXE_PATH);
        callback(-1, 'EXE patch reverted.');
    }
}

async function createBackups(callback, asarPath) {
    callback(0.9, 'Creating ASAR backup...');
    await copyFile(asarPath, ASAR_TMP_BACKUP_PATH);
    callback(0.9, 'ASAR backup created.');
}

async function replaceAsar(callback, patchType, fromAsarSrc, asarPath) {
    callback(0.9, 'Replacing ASAR...');
    await copyFile((patchType === PatchTypes.FROM_MOD && fromAsarSrc) ? fromAsarSrc : ASAR_TMP_PATH, asarPath);
    callback(0.9, 'ASAR replaced.');
}

async function closeYmIfRunning(callback) {
    if (await isYandexMusicRunning()) {
        callback(0.9, 'Yandex Music is running. Closing it...', 'Closing Yandex Music...');
        await closeYandexMusic();
        callback(0.9, 'Yandex Music closed.');
        return true;
    }
    return false;
}

async function prepareModAsarFile(patchType, callback) {
    if (patchType !== PatchTypes.FROM_MOD) {
        await downloadAsar(callback);

        if (shouldDecompress) {
            callback(0.8, 'Decompressing...');
            await decompressFile(ASAR_GZ_TMP_PATH, ASAR_TMP_PATH)
            callback(0.9, 'Decompressed.');
        }
    } else {
        callback(0.9, 'Updating from mod... Downloading ASAR skipped...');
    }
}

export async function installMod(callback, { patchType = PatchTypes.DEFAULT, fromAsarSrc = undefined, customPathToYMAsar = undefined }) {
    const ymMetadata = await getYandexMusicMetadata();
    callback(0, 'Preparing to install...');
    const asarPath = customPathToYMAsar ?? getYMAsarDefaultPath();

    if (!asarPath) {
        return callback(-1, 'No install destination');
    }

    if (!(await checkMacPermissions())) {
        return callback(-1, 'Please grant App management or Full disk access to the app in System Preferences > Security & Privacy', 'Action required');
    }

    oldYMHash = calcASARHeaderHash(YM_ASAR_PATH).hash;

    await prepareModAsarFile(patchType, callback);

    const wasYmClosed = await closeYmIfRunning(callback);

    await createBackups(callback, asarPath);
    await replaceAsar(callback, patchType, fromAsarSrc, asarPath);

    const isAsarIntegrityBypassed = await bypassAsarIntegrity(YM_PATH, callback);

    if (!isAsarIntegrityBypassed) {
        await applyBackups(callback, asarPath);
        return false;
    }

    callback(1, 'Installed!');
    logger.log('Installed mod version:', modVersion, 'YM version:', ymMetadata.version, 'Patch type:', patchType);

    await clearCaches(callback);
    await postInstallTasks(ymMetadata, wasYmClosed, callback);

    setTimeout(()=>callback(0, 'Task finished.'), 2000);

}

async function downloadAsar(callback) {
    const filenamePrefix = State.get('patchType') === 'default' ? 'app.asar' : 'appDevTools.asar';
    const priorityFiles = [filenamePrefix];
    if (State.get('useZIP')) {
        priorityFiles.unshift(`${filenamePrefix}.gz`)
    }

    const metadata = await getReleaseMetadata(LATEST_RELEASE_URL);
    const assets = metadata?.assets;
    modVersion = metadata?.name;

    let url = undefined;

    for (const filename of priorityFiles) {
        const asset = assets.find((a) => a?.name === filename);
        if (asset) {
            if (filename === `${filenamePrefix}.gz`) shouldDecompress = true;
            url = asset.browser_download_url;
            break;
        }
    }

    await downloadFile(url, path.join(TMP_PATH, (shouldDecompress ? 'app.asar.gz' : 'app.asar')),
        (progress, label) => {
            callback(progress*0.8, label);
        }
    );

}



async function copyFile(target, dest) {
    await fso.promises.copyFile(target, dest);
}

async function createDirIfNotExist(target) {
    if(!fs.existsSync(target)){
        await fsp.mkdir(target);
    }
}

async function decompressFile(target, dest) {
    const compressedData = await fsp.readFile(target);

    const decompressedData = await unzipPromise(compressedData);

    await fso.promises.writeFile(dest, decompressedData);
}

export async function getReleaseMetadata(releaseUrl = undefined) {
    const response = await fetch(releaseUrl ?? LATEST_RELEASE_URL);
    if (!response.ok) {
         throw new Error(`Failed to fetch release metadata: ${response.status} - ${response.statusText}:${await response.json()}`);
    }
    return await response.json();
}

async function getYandexMusicMetadata() {
    return yaml.load(await (await fetch(YM_RELEASE_METADATA_URL)).text());
}

function getYMAsarDefaultPath() {
    return (fs.existsSync(YM_ASAR_PATH) ? YM_ASAR_PATH : undefined);
}

function calcASARHeaderHash(archivePath) {
    const headerString = asar.getRawHeader(archivePath).headerString;
    const hash = crypto.createHash('sha256').update(headerString).digest('hex');
    return { algorithm: 'SHA256', hash };
}

function dumpEntitlements(appPath, callback) {
    try {
        execSync(`codesign -d --entitlements :- '${appPath}' > '${EXTRACTED_ENTITLEMENTS_PATH}'`);
        callback(0.8, `Entitlements dumped from ${appPath} to ${EXTRACTED_ENTITLEMENTS_PATH}`);
    } catch (error) {
        callback(-1, `Unable dump entitlements from ${appPath} to ${EXTRACTED_ENTITLEMENTS_PATH}.`, error);
    }
}

function checkIfElectronAsarIntegrityIsUsed() {
    try {
        execSync(`plutil -p '${INFO_PLIST_PATH}' | grep -q ElectronAsarIntegrity`);
        return true;
    } catch {
        return false;
    }
}

function checkIfSystemIntegrityProtectionEnabled() {
    return false; // TODO Переделать проверку на SIP
    try {
        const response = execSync(`csrutil status`);
        return response.includes('enabled');
    } catch {
        return false;
    }
}

export async function checkMacPermissions() {
    if (!isMac) return true
    const asarPath = getYMAsarDefaultPath();
    try {
        await copyFile(asarPath, asarPath);
        return true;
    } catch(e) {
        return false
    }
}

export async function isInstallPossible(callback) {
    if (!(await checkMacPermissions())) {
        callback(0, 'Please grant App management or Full disk access to the app in System Preferences > Security & Privacy');
        return { status: false, request: Events.REQUEST_MAC_PERMISSIONS };
    }

    if (isLinux) {
        callback(0, "Linux is not supported yet.");
        return { status: false, request: '' };
    }

    const isLegacyYMInstalled = await checkIfLegacyYMInstalled();

    if (isLegacyYMInstalled && !State.get('ignoreLegacyYM')) {
        return { status: false, request: Events.REQUEST_LEGACY_YM_APP_DELETION };
    }

    const ymAsarPath = getYMAsarDefaultPath();
    if(!ymAsarPath) {
        callback(0, "Can't find Yandex Music application in default path: " + YM_ASAR_PATH);
        return { status: false, request: Events.REQUEST_YM_PATH };
    }

    callback(0, "Yandex Music application found: " + ymAsarPath);
    return { status: true, request: null }
}

// Патчинг exe-файла Яндекс Музыки (Windows)
async function bypassAsarIntegrityWin(callback) {
    callback(0.9, "Asar integrity enabled. Bypassing...");
    callback(0.9, `Preparing to replace hash`);
    try {
        // 1) Path to the executable file
        const localAppData = process.env.LOCALAPPDATA;
        if (!localAppData) {
            callback(-1, 'Environment variable LOCALAPPDATA is not defined', 'Error occurred');
            return false;
        }
        YM_EXE_PATH = path.join(localAppData, 'Programs', 'YandexMusic', 'Яндекс Музыка.exe');

        if (!fs.existsSync(YM_EXE_PATH)) {
            callback(-1, `File not found at path: ${YM_EXE_PATH}`, 'Error occurred');
            return false;
        }

        // 2) Create a backup
        if (!fs.existsSync(YM_EXE_TMP_BACKUP_PATH)) {
            fs.copyFileSync(YM_EXE_PATH, YM_EXE_TMP_BACKUP_PATH);
            callback(0.9, `Backup created: ${YM_EXE_TMP_BACKUP_PATH}`, 'Backup created');
        } else {
            callback(0.9, `Backup already exists: ${YM_EXE_TMP_BACKUP_PATH}`, 'Backup already exists');
        }

        // 3) Patterns (ASCII‑hex)
        const oldHexStr = oldYMHash;
        const newHexStr = calcASARHeaderHash(YM_ASAR_PATH).hash;

        callback(0.9, `Hashes: ${oldHexStr} ${newHexStr} ${oldHexStr.length} ${newHexStr.length}`, 'Extracted hashes');

        if (oldHexStr.length !== newHexStr.length) {
            callback(-1, 'Old and new hashes lengths do not match', 'Hashes length mismatch');
            return false;
        }

        if (oldHexStr === newHexStr) {
            callback(0.9, 'Old and new hashes are the same, no changes needed', 'Hashes match');
            return true;
        }

        const oldBuf = Buffer.from(oldHexStr, 'ascii');
        const newBuf = Buffer.from(newHexStr, 'ascii');

        // 4) Read, replace, write
        const fileBuf = fs.readFileSync(YM_EXE_PATH);
        let count = 0;
        let offset = 0;

        while (true) {
            const idx = fileBuf.indexOf(oldBuf, offset);
            if (idx === -1) break;
            newBuf.copy(fileBuf, idx);
            count++;
            offset = idx + oldBuf.length;
        }

        if (count === 0) {
            callback(-1, 'Pattern not found, no changes made.', 'Hash not found');
            return false;
        } else {
            fs.writeFileSync(YM_EXE_PATH, fileBuf);
            callback(0.99, `Successfully replaced ${count} occurrences.`, 'Hash replaced');
        }
        return true;

    } catch (err) {
        callback(-1, 'Error: ' + err.message);
        return false;
    }
}

function bypassAsarIntegrityDarwin(callback) {
    callback(0.9, "Asar integrity enabled. Bypassing...");
    const newHash = calcASARHeaderHash(YM_ASAR_PATH).hash;
    callback(0.9, `Modified asar hash: ${newHash}`);
    callback(0.9, "Replacing hash in Info.plist");

    const plistContent = fs.readFileSync(INFO_PLIST_PATH, 'utf8');
    const plistData = plist.parse(plistContent);
    plistData.ElectronAsarIntegrity["Resources/app.asar"].hash = newHash;
    fs.writeFileSync(INFO_PLIST_PATH, plist.build(plistData));
}

function replaceSignDarwin(callback, appPath) {
    callback(0.95, "Replacing sign");
    dumpEntitlements(appPath, callback);

    execSync(`codesign --force --entitlements '${EXTRACTED_ENTITLEMENTS_PATH}' --sign - '${appPath}'`);
}

async function bypassAsarIntegrity(appPath, callback) {
    if (checkIfSystemIntegrityProtectionEnabled()) {
        callback(-1, "System Integrity Protection enabled. Bypass is not possible, please disable SIP for File System and try again.", 'Action required');
        return false;
    }

    try {
        if (isMac) {
            if (checkIfElectronAsarIntegrityIsUsed()) {
                bypassAsarIntegrityDarwin(callback);
            }
            replaceSignDarwin(callback, appPath);
        } else if (isWin) {
            const result = await bypassAsarIntegrityWin(callback);
            if (!result) {
                callback(-1, "Failed to patch Yandex Music executable. Reverting...", 'Error occurred');
                return false;
            }
        }

        callback(0.99, "Asar integrity bypassed successfully");
        return true;

    } catch (error) {
        callback(-1, "Asar integrity bypass failed", error);
        return false
    }

}
