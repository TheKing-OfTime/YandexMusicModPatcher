import React, { useCallback, useContext, useEffect } from 'react';
import StatusWidget from '../StatusWidget.jsx';
import { UpdaterStateContext } from '../../../UpdaterStateContext.jsx';
import {
    useOnSelfUpdaterStatus,
    useOnSelfUpdaterCheckStarted,
    useOnSelfUpdaterCheckFailed,
    useOnSelfUpdateProgress,
    useSendInstallSelfUpdate,
} from '../../../Events.jsx';

const CHECKING_UPDATES = 'Проверка обновлений...';
const UPDATE_AVAILABLE = 'Доступно обновление';
const DOWNLOADING = 'Загрузка...';
const UP_TO_DATE = 'Актуально';
const ERROR = 'Ошибка';
const CHECK_FAILED = 'Ошибка';

function SelfWidget() {
    const { state, updateSelfState } = useContext(UpdaterStateContext);
    const selfState = state.self;

    const handleUpdaterStatus = useCallback((event, { isUpdateAvailable, version, newVersion }) => {
        updateSelfState({
            version,
            newVersion: isUpdateAvailable ? newVersion : '',
            status: isUpdateAvailable ? UPDATE_AVAILABLE : UP_TO_DATE,
            progress: 0,
        });
    }, [updateSelfState]);

    const handleUpdateProgress = useCallback((event, { progress, label }) => {
        if (progress === -1) {
            updateSelfState({ status: ERROR });
        } else if (progress === 1) {
            updateSelfState({
                status: 'Установлено',
                progress: 0,
                version: selfState.newVersion,
                newVersion: '',
            });
        } else if (progress === 0) {
            updateSelfState({
                status: DOWNLOADING,
                progress: 0.5,
            });
        } else {
            updateSelfState({
                status: label || DOWNLOADING,
                progress: Math.max(0, Math.min(1, progress)),
            });
        }
    }, [updateSelfState, selfState.newVersion]);

    const handleCheckStarted = useCallback(() => {
        updateSelfState({
            status: CHECKING_UPDATES,
            progress: 1.1,
        });
    }, [updateSelfState]);

    const handleCheckFailed = useCallback((event, { error }) => {
        updateSelfState({
            status: CHECK_FAILED.concat(` ${error.errorCode}: ${error.errorMessage}`),
            progress: 0,
        });
    }, [updateSelfState]);

    const handleInstallClick = useCallback(() => {
        useSendInstallSelfUpdate();
    }, []);

    const getVersionDisplay = (version, newVersion) => {
        if (newVersion) {
            return `v${version} -> v${newVersion}`;
        }
        return version ? `v${version}` : '';
    };

    useEffect(() => {
        const offStatus = useOnSelfUpdaterStatus(handleUpdaterStatus);
        const offCheckStarted = useOnSelfUpdaterCheckStarted(handleCheckStarted);
        const offCheckFailed = useOnSelfUpdaterCheckFailed(handleCheckFailed);
        const offProgress = useOnSelfUpdateProgress(handleUpdateProgress);

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
            name={'Патчер'}
            status={selfState.status}
            progress={selfState.progress}
            version={getVersionDisplay(selfState.version, selfState.newVersion)}
            icon={'logo'}
            isUpdateAvailable={selfState.status === UPDATE_AVAILABLE}
            onInstallClick={handleInstallClick}
        />
    );
}

export default SelfWidget;
