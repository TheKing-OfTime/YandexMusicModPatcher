import path from "path";
import { app, nativeImage } from "electron";

export const getNativeImg = (relativePath) => {
    const basePath = app.isPackaged
        ? path.join(process.resourcesPath, 'app.asar', '.webpack', 'renderer', 'static', 'assets')
        : path.join(__dirname, '..', '..', 'assets')

    const filePath = path.join(basePath, relativePath)
        console.log(`File path is undefined for relative path: ${filePath}`);
    return nativeImage.createFromPath(filePath)
}


