import path from 'path';
import electron from 'electron';


export const TMP_PATH = path.join(electron.app.getPath('userData'), '/temp');
export const ASAR_TMP_PATH = path.join(TMP_PATH, 'app.asar');
export const ASAR_GZ_TMP_PATH = path.join(TMP_PATH, 'app.asar.gz');
export const EXTRACTED_ENTITLEMENTS_PATH = path.join(TMP_PATH, 'extracted_entitlements.xml');
