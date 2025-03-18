import electron from "electron";
import path from "path";
import { promisify } from "util";
import axios from "axios";
import os from "os";
import * as fso from 'original-fs';

import * as zlib from "node:zlib";
import * as fs from 'fs';
import * as fsp from 'fs/promises'

const unzipPromise = promisify(zlib.unzip);

const TMP_PATH = path.join(electron.app.getPath('userData'), '/temp');
const ASAR_TMP_PATH = path.join(TMP_PATH, 'app.asar');
const ASAR_GZ_TMP_PATH = path.join(TMP_PATH, 'app.asar.gz');
const LATEST_RELEASE_URL = `https://api.github.com/repos/TheKing-OfTime/YandexMusicModClient/releases/latest`;
const YM_RELEASE_METADATA_URL = 'http://music-desktop-application.s3.yandex.net/stable/latest.yml';
const YM_RELEASE_DOWNLOAD_URL = 'http://music-desktop-application.s3.yandex.net/stable/download.json';

const DEFAULT_YM_ASAR_PATH = {
    darwin: '',
    linux: '',
    win32: path.join(process?.env?.LOCALAPPDATA , 'Programs', 'YandexMusic', 'resources', 'app.asar'),
}

let shouldDecompress = false;

await createDirIfNotExist(TMP_PATH);

export async function installMod(callback, customPathToYMAsar=undefined) {
    callback(0, 'Preparing to install...');
    const asarPath = customPathToYMAsar ?? getYMAsarDefaultPath();

    if (!asarPath) {
        return callback(-1, 'No install destination');
    }

    await downloadAsar(callback);

    if (shouldDecompress) {
        callback(1, 'Decompressing...');
        await decompressFile(ASAR_GZ_TMP_PATH, ASAR_TMP_PATH)
        callback(1, 'Decompressed');
    }

    callback(1, 'Installing...');
    await copyFile(ASAR_TMP_PATH, asarPath);
    callback(1, 'Installed!');

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

    await downloadFile(url, path.join(TMP_PATH, (shouldDecompress ? 'app.asar.gz' : 'app.asar')), callback);

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
    return (fs.existsSync(DEFAULT_YM_ASAR_PATH[os.platform()]) ? DEFAULT_YM_ASAR_PATH[os.platform()] : undefined);
}
