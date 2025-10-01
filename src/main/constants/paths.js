import path from 'path';
import electron from 'electron';


export const TMP_PATH = path.join(electron.app.getPath('userData'), '/temp');
export const ASAR_TMP_PATH = path.join(TMP_PATH, 'app.asar');
export const ASAR_UNPACKED_ZIP_TMP_PATH = path.join(TMP_PATH, 'app.asar.unpacked.zip');
export const ASAR_UNPACKED_TMP_PATH = path.join(TMP_PATH, 'app.asar.unpacked');
export const ASAR_GZ_TMP_PATH = path.join(TMP_PATH, 'app.asar.gz');
export const ASAR_ZST_TMP_PATH = path.join(TMP_PATH, 'app.asar.zst');
export const ASAR_TMP_BACKUP_PATH = path.join(TMP_PATH, 'app.asar.backup');
export const YM_EXE_TMP_BACKUP_PATH = path.join(TMP_PATH, 'ym.exe.backup');
export const EXTRACTED_ENTITLEMENTS_PATH = path.join(TMP_PATH, 'extracted_entitlements.xml');

export const UPDATERS_TMP_PATH = path.join(TMP_PATH, 'updaters');
export const MOD_UPDATER_TMP = path.join(UPDATERS_TMP_PATH, 'modUpdater');
export const SELF_UPDATER_TMP = path.join(UPDATERS_TMP_PATH, 'selfUpdater');
export const YM_UPDATER_TMP = path.join(UPDATERS_TMP_PATH, 'ymUpdater');
