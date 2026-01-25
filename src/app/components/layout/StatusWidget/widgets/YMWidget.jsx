import React, { useCallback, useContext, useEffect } from 'react';
import StatusWidget from '../StatusWidget.jsx';
import { UpdaterStateContext } from '../../../UpdaterStateContext.jsx';
import {
    useOnYMUpdaterStatus,
    useOnYMUpdaterCheckStarted,
    useOnYMUpdaterCheckFailed,
    useOnYMUpdateProgress,
    useSendInstallAllUpdates,
} from '../../../Events.jsx';

const CHECKING_UPDATES = 'Проверка обновлений...';
const UPDATE_AVAILABLE = 'Доступно обновление';
const DOWNLOADING = 'Загрузка...';
const UP_TO_DATE = 'Актуально';
const ERROR = 'Ошибка';
const CHECK_FAILED = 'Ошибка';

function YMWidget() {
    const { state, updateYMState } = useContext(UpdaterStateContext);
    const ymState = state.ym;

    const handleUpdaterStatus = useCallback((event, { isUpdateAvailable, version, newVersion }) => {
        updateYMState({
            version,
            newVersion: isUpdateAvailable ? newVersion : '',
            status: isUpdateAvailable ? UPDATE_AVAILABLE : UP_TO_DATE,
            progress: 0,
        });
    }, [updateYMState]);

    const handleUpdateProgress = useCallback((event, { progress, label }) => {
        if (progress === -1) {
            updateYMState({ status: ERROR });
        } else if (progress === 1) {
            updateYMState({
                status: 'Установлено',
                progress: 0,
                version: ymState.newVersion,
                newVersion: '',
            });
        } else if (progress === 0) {
            updateYMState({
                status: DOWNLOADING,
                progress: 0.5,
            });
        } else {
            updateYMState({
                status: label || DOWNLOADING,
                progress: Math.max(0, Math.min(1, progress)),
            });
        }
    }, [updateYMState, ymState.newVersion]);

    const handleCheckStarted = useCallback(() => {
        updateYMState({
            status: CHECKING_UPDATES,
            progress: 1.1,
        });
    }, [updateYMState]);

    const handleCheckFailed = useCallback((event, { error }) => {
        updateYMState({
            status: CHECK_FAILED.concat(` ${error.errorCode}: ${error.errorMessage}`),
            progress: 0,
        });
    }, [updateYMState]);

    const handleInstallClick = useCallback(() => {
        useSendInstallAllUpdates();
    }, []);

    const getVersionDisplay = (version, newVersion) => {
        if (newVersion) {
            return `${version} -> ${newVersion}`;
        }
        return version ? `${version}` : '';
    };

    useEffect(() => {
        const offStatus = useOnYMUpdaterStatus(handleUpdaterStatus);
        const offCheckStarted = useOnYMUpdaterCheckStarted(handleCheckStarted);
        const offCheckFailed = useOnYMUpdaterCheckFailed(handleCheckFailed);
        const offProgress = useOnYMUpdateProgress(handleUpdateProgress);

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
            name={'Яндекс Музыка'}
            status={ymState.status}
            progress={ymState.progress}
            version={getVersionDisplay(ymState.version, ymState.newVersion)}
            icon={'ym_logo'}
            isUpdateAvailable={ymState.status === UPDATE_AVAILABLE}
            onInstallClick={handleInstallClick}
        />
    );
}

export default YMWidget;
