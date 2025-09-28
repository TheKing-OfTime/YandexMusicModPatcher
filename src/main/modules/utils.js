import path from "path";
import { promisify } from 'util'
import { pipeline } from 'stream/promises';
import { exec, spawn } from 'child_process'
import { app, nativeImage } from "electron";
import axios from "axios";
import fso from "original-fs";
import unzipper from "unzipper";
import fs from "fs";
import { Logger } from "./Logger.js";
import { YM_ASAR_PATH } from './patcher.js';


const execAsync = promisify(exec);
const spawnAsync = promisify(spawn);
const logger = new Logger("utils");

export const isWin = process.platform === 'win32';
export const isMac = process.platform === 'darwin';
export const isLinux = process.platform === 'linux';

export const getNativeImg = (relativePath) => {
    const basePath = app.isPackaged
        ? path.join(process.resourcesPath, 'app.asar', '.webpack', 'renderer', 'static', 'assets')
        : path.join(__dirname, '..', '..', 'assets')

    const filePath = path.join(basePath, relativePath);
    if (!filePath || !fso.existsSync(filePath)) {
        logger.log(`File path is undefined for relative path: ${filePath}`);
    }
    return nativeImage.createFromPath(filePath)
}

// Copied from https://github.com/PulseSync-LLC/PulseSync-client/blob/dev/src/main/utils/appUtils.ts
export async function getYandexMusicProcesses() {
    if (process.platform === "darwin") {
        try {
            const command = `pgrep -f "Яндекс Музыка"`
            const { stdout } = await execAsync(command, { encoding: 'utf8' })
            const processes = stdout.split('\n').filter(line => line.trim() !== '')
            return processes.map(pid => ({ pid: parseInt(pid, 10) })).filter(proc => !isNaN(proc.pid))
        } catch (error) {
            logger.error('Error retrieving Yandex Music processes on Mac:', error)
            return []
        }
    } else if (process.platform === "linux") {
        try {
            const command = `pgrep -fa "yandexmusic"`
            const { stdout } = await execAsync(command, { encoding: 'utf8' })
            const processes = stdout.split('\n')
                .filter(line => line.trim() !== '')
                .filter(line => !['pgrep', 'yandexmusicmodpatcher', 'YandexMusicModPatcher'].some(keyword => line.includes(keyword)))
            return processes.map(line => {
                const parts = line.split(' ');
                const pid = parseInt(parts[0], 10);
                return { pid };
            }).filter(proc => !isNaN(proc.pid));
        } catch (error) {
            logger.error('Error retrieving Yandex Music processes on Linux:', error)
            return []
        }
    } else {
        try {
            const command = `tasklist /FI "IMAGENAME eq Яндекс Музыка.exe" /FO CSV /NH`
            const { stdout } = await execAsync(command, { encoding: 'utf8' })
            const processes = stdout.split('\n').filter(line => line.trim() !== '')
            const yandexProcesses = []
            processes.forEach(line => {
                const parts = line.split('","')
                if (parts.length > 1) {
                    const pidStr = parts[1].replace(/"/g, '').trim()
                    const pid = parseInt(pidStr, 10)
                    if (!isNaN(pid)) {
                        yandexProcesses.push({ pid })
                    }
                }
            })
            return yandexProcesses
        } catch (error) {
            logger.error('Error retrieving Yandex Music processes:', error)
            return []
        }
    }
}

export async function isYandexMusicRunning() {
    return (await getYandexMusicProcesses())?.length > 0;
}

export async function closeYandexMusic() {
    const yandexProcesses = await getYandexMusicProcesses();
    if (yandexProcesses.length === 0) {
        logger.info('Yandex Music is not running.')
        return
    }

    for (const proc of yandexProcesses) {
        try {
            process.kill(proc.pid)
            logger.info(`Yandex Music process with PID ${proc.pid} has been terminated.`)
        } catch (error) {
            logger.error(`Error terminating process ${proc.pid}:`, error)
        }
    }
}

export async function launchYandexMusic() {
    await openExternalDetached('yandexmusic://');
}

export async function openExternalDetached(url) {
    let command, args;

    if (process.platform === 'win32') {
        command = 'cmd.exe';
        args = ['/c', 'start', '', url];
    } else if (process.platform === 'darwin') {
        command = 'open';
        args = [url];
    } else {
        command = 'xdg-open';
        args = [url];
    }

    (await spawnAsync(command, args, { detached: true, stdio: 'ignore', })).unref();
}

export async function downloadFile(url, dest, callback) {
    const response = await axios.get(url, {
        responseType: 'stream',
        onDownloadProgress: progress => {
            callback(progress.progress, `Downloading ${path.basename(dest)}... ${Math.ceil(progress.progress*100)}%`, 'vrb');
        }
    });

    const writer = fso.createWriteStream(dest);

    try {
        await pipeline(response.data, writer);
        callback(1, 'Download completed: ' + path.basename(dest));
        return dest;
    } catch (err) {
        writer.close();
        callback(-1, 'Download error: ' + err);
        throw err;
    }
}

export async function checkIfLegacyYMInstalled() {
    if (!isWin) return false;
    const command = 'Get-AppxPackage *yandex.music* | Select-Object -ExpandProperty Name';

    try {
        const { stdout } = await execAsync(command, {'shell':'powershell.exe'});
        return (stdout.match(/yandex\.music/gi)?.length ?? 0) > 0;
    } catch (error) {
        return false;
    }
}

export async function deleteLegacyYM() {
    const command = 'Get-AppxPackage *yandex.music* | Remove-AppxPackage';

    try {
        const { stdout } = await execAsync(command, {'shell':'powershell.exe'});
        return stdout.trim().length > 0;
    } catch (error) {
        return false;
    }
}

export async function getInstalledYmMetadata() {
    const ymMetadataPath = path.join(YM_ASAR_PATH, 'package.json');
    if (!fs.existsSync(ymMetadataPath)) return null;

    try {
        const data = fs.readFileSync(ymMetadataPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        logger.error('Error reading mod metadata:', error);
        return null;
    }
}

export function formatTimeStampDiff(date1, date2) {
    let diffMs = Math.abs(date1 - date2);

    let seconds = Math.floor(diffMs / 1000) % 60;
    let minutes = Math.floor(diffMs / (1000 * 60)) % 60;
    let hours = Math.floor(diffMs / (1000 * 60 * 60));

    let result = (hours ? (hours + 'h ') : '');
    result += (minutes ? (minutes + 'm ') : '');
    result += (seconds ? (seconds + 's ') : '');
    result += (diffMs % 1000 + 'ms');

    return result;
}

export async function unzipFolder(zipPath, outputFolder) {
    await new Promise((resolve, reject) => {
        fs.createReadStream(zipPath)
            .pipe(unzipper.Extract({ path: outputFolder }))
            .on('close', resolve)
            .on('finish', resolve)
            .on('error', reject);
    });
}
