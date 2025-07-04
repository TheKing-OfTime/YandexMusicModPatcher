import electron from "electron";
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
import { downloadFile, isYandexMusicRunning, closeYandexMusic, launchYandexMusic, isMac, isWin, isLinux, checkIfLegacyYMInstalled } from "./utils.js";
import { getState } from "./state.js";

const State = getState();

const unzipPromise = promisify(zlib.unzip);

const TMP_PATH = path.join(electron.app.getPath('userData'), '/temp');
const ASAR_TMP_PATH = path.join(TMP_PATH, 'app.asar');
const ASAR_GZ_TMP_PATH = path.join(TMP_PATH, 'app.asar.gz');
const LATEST_RELEASE_URL = `https://api.github.com/repos/TheKing-OfTime/YandexMusicModClient/releases/latest`;
const YM_RELEASE_METADATA_URL = 'https://music-desktop-application.s3.yandex.net/stable/latest.yml';
const YM_RELEASE_DOWNLOAD_URL = 'https://music-desktop-application.s3.yandex.net/stable/download.json';

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

const EXTRACTED_ENTITLEMENTS_PATH = path.join(TMP_PATH, 'extracted_entitlements.xml');
let YM_PATH = DEFAULT_YM_PATH[os.platform];
let INFO_PLIST_PATH = path.join(YM_PATH, 'Contents', 'Info.plist');
let YM_ASAR_PATH = resolveAsarPath(YM_PATH, os.platform());

export const updatePaths = (ymPath) => {
    YM_PATH = ymPath;
    INFO_PLIST_PATH = path.join(YM_PATH, 'Contents', 'Info.plist');
    YM_ASAR_PATH = resolveAsarPath(YM_PATH, os.platform());
}

let shouldDecompress = false;
let modVersion = undefined;

await createDirIfNotExist(TMP_PATH);

export async function installMod(callback, customPathToYMAsar=undefined) {
    const ymMetadata = await getYandexMusicMetadata();
    callback(0, 'Preparing to install...');
    const asarPath = customPathToYMAsar ?? getYMAsarDefaultPath();

    if (!asarPath) {
        return callback(-1, 'No install destination');
    }

    if (!(await checkMacPermissions())) {
        return callback(-1, 'Please grant App management or Full disk access to the app in System Preferences > Security & Privacy');
    }

    await downloadAsar(callback);

    if (shouldDecompress) {
        callback(0.8, 'Decompressing...');
        await decompressFile(ASAR_GZ_TMP_PATH, ASAR_TMP_PATH)
        callback(0.9, 'Decompressed');
    }


    let wasYmClosed = false;

    if (await isYandexMusicRunning()) {
        callback(0.9, 'Yandex Music is running. Closing it...');
        await closeYandexMusic();
        wasYmClosed = true;
        callback(0.9, 'Yandex Music closed.');
    }


    callback(0.9, 'Replacing ASAR...');
    await copyFile(ASAR_TMP_PATH, asarPath);

    let isAsarIntegrityBypassed = false;

    if (isMac) isAsarIntegrityBypassed = await bypassAsarIntegrity(YM_PATH, callback);

    (!isMac || isAsarIntegrityBypassed) && callback(1, 'Installed!');

    State.set('lastPatchInfo', {
        modVersion: modVersion,
        ymVersion: ymMetadata.version,
        patchType: State.get('patchType'),
        date: new Date().toISOString(),
    });
    console.log(State.get('lastPatchInfo'));

    if (await isYandexMusicRunning() && wasYmClosed) {
        callback(0, 'Yandex Music was closed while mod install. Launching it...');
        try {
            await launchYandexMusic();
        } catch (e) {
            callback(-1, 'Failed to launch Yandex Music: ' + e.message);
        } finally {
            callback(0, 'Yandex Music launched.');
        }
    }

}

async function downloadAsar(callback) {
    const filenamePrefix = State.get('patchType') === 'default' ? 'app.asar' : 'appDevTools.asar';
    const priorityFiles = [filenamePrefix];
    if (State.get('useZIP')) {
        priorityFiles.unshift(`${filenamePrefix}.gz`)
    }

    const metadata = (await getReleaseMetadata(LATEST_RELEASE_URL))?.assets;
    modVersion = metadata.name;

    let url = undefined;

    for (const filename of priorityFiles) {
        const asset = metadata.find((a) => a.name === filename);
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

export async function getReleaseMetadata(releaseUrl=undefined) {
    return await (await fetch(releaseUrl ?? LATEST_RELEASE_URL)).json();
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
        return { status: false, request: 'REQUEST_MAC_PERMISSIONS' };
    }

    if (isLinux) {
        callback(0, "Linux is not supported yet.");
        return { status: false, request: '' };
    }

    const isLegacyYMInstalled = await checkIfLegacyYMInstalled();

    if (isLegacyYMInstalled && !State.get('ignoreLegacyYM')) {
        return { status: false, request: 'REQUEST_LEGACY_YM_APP_DELETION' };
    }

    const ymAsarPath = getYMAsarDefaultPath();
    if(!ymAsarPath) {
        callback(0, "Can't find Yandex Music application in default path: " + YM_ASAR_PATH);
        return { status: false, request: 'REQUEST_YM_PATH' };
    }

    callback(0, "Yandex Music application found: " + ymAsarPath);
    return { status: true, request: null }
}

async function bypassAsarIntegrity(appPath, callback) {
    if (!isMac) {
        callback(-1, "Failed to bypass asar integrity: Available only for macOS");
        return false;
    }

    if (checkIfSystemIntegrityProtectionEnabled()) {
        callback(-1, "System Integrity Protection enabled. Bypass is not possible, please disable SIP for File System and try again.");
        return false;
    }

    try {
        if (checkIfElectronAsarIntegrityIsUsed()) {
            callback(0.9, "Asar integrity enabled. Bypassing...");
            const newHash = calcASARHeaderHash(YM_ASAR_PATH).hash;
            callback(0.9, `Modified asar hash: ${newHash}`);
            callback(0.9, "Replacing hash in Info.plist");

            const plistContent = fs.readFileSync(INFO_PLIST_PATH, 'utf8');
            const plistData = plist.parse(plistContent);
            plistData.ElectronAsarIntegrity["Resources/app.asar"].hash = newHash;
            fs.writeFileSync(INFO_PLIST_PATH, plist.build(plistData));
        }

        callback(0.95, "Replacing sign");
        dumpEntitlements(appPath, callback);

        execSync(`codesign --force --entitlements '${EXTRACTED_ENTITLEMENTS_PATH}' --sign - '${appPath}'`);
        fs.unlinkSync(EXTRACTED_ENTITLEMENTS_PATH);
        callback(0.99, "Cache cleared");

        callback(0.99, "Asar integrity bypassed successfully");
        return true;

    } catch (error) {
        callback(-1, "Asar integrity bypass failed", error);
        fs.unlinkSync(EXTRACTED_ENTITLEMENTS_PATH);
        callback(-1, "Cache cleared");
    }

}
