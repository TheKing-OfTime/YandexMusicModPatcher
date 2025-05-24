import path from "path";
import { promisify } from 'util'
import { exec, execSync } from 'child_process'
import { app, nativeImage } from "electron";

const execAsync = promisify(exec);

export const getNativeImg = (relativePath) => {
    const basePath = app.isPackaged
        ? path.join(process.resourcesPath, 'app.asar', '.webpack', 'renderer', 'static', 'assets')
        : path.join(__dirname, '..', '..', 'assets')

    const filePath = path.join(basePath, relativePath)
        console.log(`File path is undefined for relative path: ${filePath}`);
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
            console.error('Error retrieving Yandex Music processes on Mac:', error)
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
            console.error('Error retrieving Yandex Music processes:', error)
            return []
        }
    }
}

export async function isYandexMusicRunning() {
    return !!(await getYandexMusicProcesses());
}

export async function closeYandexMusic() {
    const yandexProcesses = await getYandexMusicProcesses();
    if (yandexProcesses.length === 0) {
        console.info('Yandex Music is not running.')
        return
    }

    for (const proc of yandexProcesses) {
        try {
            process.kill(proc.pid)
            console.info(`Yandex Music process with PID ${proc.pid} has been terminated.`)
        } catch (error) {
            console.error(`Error terminating process ${proc.pid}:`, error)
        }
    }
}
