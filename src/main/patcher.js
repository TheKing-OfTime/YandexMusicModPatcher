import electron, { shell } from "electron";
import path from "path";
import { promisify } from "util";
import axios from "axios";
import os from "os";
import crypto from "crypto";
import * as fso from 'original-fs';

import * as zlib from "node:zlib";
import * as fs from 'fs';
import * as fsp from 'fs/promises'
import { execSync } from "child_process";
import asar from '@electron/asar';
import plist from 'plist';

const isMAC = process.platform === 'darwin';
const isWIN = process.platform === 'win32';
const isLINUX = process.platform === 'linux';

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

await createDirIfNotExist(TMP_PATH);

export async function installMod(callback, customPathToYMAsar=undefined) {
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

    callback(0.9, 'Replacing ASAR...');
    await copyFile(ASAR_TMP_PATH, asarPath);

    let isAsarIntegrityBypassed = false;

    if (isMAC) isAsarIntegrityBypassed = await bypassAsarIntegrity(YM_PATH, callback);

    (!isMAC || isAsarIntegrityBypassed) && callback(1, 'Installed!');

}

async function downloadFile(url, path, callback) {
    const response = await axios.get(url,{
        responseType: 'stream',
        onDownloadProgress: progress => {
            callback(progress.progress, 'Downloading ASAR...');
        }
    })
    response.data.pipe(fs.createWriteStream(path));

    return new Promise((resolve, reject) => {
        response.data.on('end', () => {
            resolve()
        })

        response.data.on('error', (error) => {
            callback(-1, 'Download error: ' + error);
            reject()
        })
    })
}

async function downloadAsar(callback) {
    const priorityFiles = ["app.asar.gz", "app.asar"];

    const metadata = (await getReleaseMetadata(LATEST_RELEASE_URL))?.assets;

    let url = undefined;

    for (const filename of priorityFiles) {
        const asset = metadata.find((a) => a.name === filename);
        if (asset) {
            if (filename === "app.asar.gz") shouldDecompress = true;
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
    return await (await fetch(YM_RELEASE_METADATA_URL)).json();
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
    if (!isMAC) return true
    const asarPath = getYMAsarDefaultPath();
    try {
        await copyFile(asarPath, asarPath);
        return true;
    } catch(e) {
        return false
    }
}

export async function isInstallPossible(callback) {
    if(!(await checkMacPermissions())) {
        callback(0, 'Please grant App management or Full disk access to the app in System Preferences > Security & Privacy');
        return {status: false, request: 'REQUEST_MAC_PERMISSIONS'};
    }

    if(isLINUX) {
        callback(0, "Linux is not supported yet.");
        return {status: false, request: ''};
    }

    const ymAsarPath = getYMAsarDefaultPath();
    if(!ymAsarPath) {
        callback(0, "Can't find Yandex Music application in default path: " + YM_ASAR_PATH);
        return {status: false, request: 'REQUEST_YM_PATH'};
    }

    callback(0, "Yandex Music application found: " + ymAsarPath);
    return {status: true, request: null}
}

async function bypassAsarIntegrity(appPath, callback) {
    if (!isMAC) {
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