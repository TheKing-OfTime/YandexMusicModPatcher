import React, { useCallback, useContext, useEffect } from 'react';
import StatusWidget from '../StatusWidget.jsx';
import { UpdaterStateContext } from '../../../UpdaterStateContext.jsx';
import {
    useOnModUpdaterStatus,
    useOnModUpdaterCheckStarted,
    useOnModUpdaterCheckFailed,
    useOnModUpdateProgress,
    useSendInstallAllUpdates,
} from '../../../Events.jsx';

const CHECKING_UPDATES = 'Проверка обновлений...';
const UPDATE_AVAILABLE = 'Доступно обновление';
const INSTALLING = 'Установка...';
const UP_TO_DATE = 'Актуально';
const ERROR = 'Ошибка';
const CHECK_FAILED = 'Ошибка';

function ModWidget() {
    const { state, updateModState } = useContext(UpdaterStateContext);
    const modState = state.mod;

    const handleUpdaterStatus = useCallback((event, { isUpdateAvailable, version, newVersion }) => {
        updateModState({
            version,
            newVersion: isUpdateAvailable ? newVersion : '',
            status: isUpdateAvailable ? UPDATE_AVAILABLE : UP_TO_DATE,
            progress: 0,
        });
    }, [updateModState]);

    const handleUpdateProgress = useCallback((event, { progress, label }) => {
        if (progress === -1) {
            updateModState({ status: ERROR });
        } else if (progress === 1) {
            updateModState({
                status: 'Установлено',
                progress: 0,
                version: modState.newVersion,
                newVersion: '',
            });
        } else if (progress === 0) {
            updateModState({
                status: INSTALLING,
                progress: 1.1,
            });
        } else {
            updateModState({
                status: label || INSTALLING,
                progress: Math.max(0, Math.min(1, progress)),
            });
        }
    }, [updateModState, modState.newVersion]);

    const handleCheckStarted = useCallback(() => {
        updateModState({
            status: CHECKING_UPDATES,
            progress: 1.1,
        });
    }, [updateModState]);

    const handleCheckFailed = useCallback((event, { error }) => {
        updateModState({
            status: CHECK_FAILED.concat(` ${error.errorCode}: ${error.errorMessage}`),
            progress: 0,
        });
    }, [updateModState]);

    const handleInstallClick = useCallback(() => {
        useSendInstallAllUpdates();
    }, []);

    const getVersionDisplay = (version, newVersion) => {
        if (newVersion) {
            return `v${version} -> v${newVersion}`;
        }
        return version ? `v${version}` : '';
    };

    useEffect(() => {
        const offStatus = useOnModUpdaterStatus(handleUpdaterStatus);
        const offCheckStarted = useOnModUpdaterCheckStarted(handleCheckStarted);
        const offCheckFailed = useOnModUpdaterCheckFailed(handleCheckFailed);
        const offProgress = useOnModUpdateProgress(handleUpdateProgress);

        return () => {
            offStatus();
            offCheckStarted();
            offCheckFailed();
            offProgress();
        };
    }, [
        handleUpdaterStatus,
        handleCheckStarted,
        handleCheckFailed,
        handleUpdateProgress,
    ]);

    return (
        <StatusWidget
            name={'Мод'}
            status={modState.status}
            progress={modState.progress}
            version={getVersionDisplay(modState.version, modState.newVersion)}
            icon={'logo'}
            isUpdateAvailable={modState.status === UPDATE_AVAILABLE}
            onInstallClick={handleInstallClick}
        />
    );
}

export default ModWidget;
