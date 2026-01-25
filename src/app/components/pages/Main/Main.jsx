import React, { useCallback, useEffect, useState } from 'react';
import StatusWidget from '../../layout/StatusWidget/StatusWidget.jsx';
import '../../../styles/MainPage.css'
import {
    useOnYMUpdaterStatus,
    useOnSelfUpdaterStatus,
    useOnModUpdaterStatus,
    useOnYMUpdaterCheckStarted,
    useOnSelfUpdaterCheckStarted,
    useOnModUpdaterCheckStarted,
    useOnYMUpdaterCheckFailed,
    useOnSelfUpdaterCheckFailed,
    useOnModUpdaterCheckFailed,
    useOnYMUpdateProgress,
    useOnSelfUpdateProgress,
    useOnModUpdateProgress,
    useSendInstallAllUpdates,
    useSendInstallSelfUpdate,
} from '../../Events.jsx';

const DEFAULT_STATUS = 'Проверка обновлений...';
const CHECKING_UPDATES = 'Проверка обновлений...';
const UPDATE_AVAILABLE = 'Доступно обновление';
const DOWNLOADING = 'Загрузка...';
const INSTALLING = 'Установка...';
const UP_TO_DATE = 'Актуально';
const ERROR = 'Ошибка';
const CHECK_FAILED = 'Ошибка при проверке';

function MainPage () {
    const [ymStatus, setYmStatus] = useState(DEFAULT_STATUS);
    const [ymVersion, setYmVersion] = useState('');
    const [ymNewVersion, setYmNewVersion] = useState('');
    const [ymProgress, setYmProgress] = useState(1.1); // intermediate

    const [selfStatus, setSelfStatus] = useState(DEFAULT_STATUS);
    const [selfVersion, setSelfVersion] = useState('');
    const [selfNewVersion, setSelfNewVersion] = useState('');
    const [selfProgress, setSelfProgress] = useState(1.1); // intermediate

    const [modStatus, setModStatus] = useState(DEFAULT_STATUS);
    const [modVersion, setModVersion] = useState('');
    const [modNewVersion, setModNewVersion] = useState('');
    const [modProgress, setModProgress] = useState(1.1); // intermediate

    const handleYMUpdaterStatus = useCallback((event, { isUpdateAvailable, version, newVersion }) => {
        setYmVersion(version);
        if (isUpdateAvailable) {
            setYmNewVersion(newVersion);
            setYmStatus(UPDATE_AVAILABLE);
            setYmProgress(0);
        } else {
            setYmNewVersion('');
            setYmStatus(UP_TO_DATE);
            setYmProgress(0);
        }
    }, []);

    const handleSelfUpdaterStatus = useCallback((event, { isUpdateAvailable, version, newVersion }) => {
        setSelfVersion(version);
        if (isUpdateAvailable) {
            setSelfNewVersion(newVersion);
            setSelfStatus(UPDATE_AVAILABLE);
            setSelfProgress(0);
        } else {
            setSelfNewVersion('');
            setSelfStatus(UP_TO_DATE);
            setSelfProgress(0);
        }
    }, []);

    const handleModUpdaterStatus = useCallback((event, { isUpdateAvailable, version, newVersion }) => {
        setModVersion(version);
        if (isUpdateAvailable) {
            setModNewVersion(newVersion);
            setModStatus(UPDATE_AVAILABLE);
            setModProgress(0);
        } else {
            setModNewVersion('');
            setModStatus(UP_TO_DATE);
            setModProgress(0);
        }
    }, []);

    const handleYMUpdateProgress = useCallback((event, { progress, label }) => {
        if (progress === -1) {
            setYmStatus(ERROR);
        } else if (progress === 1) {
            setYmStatus('Установлено');
            setYmProgress(0);
            setYmVersion(ymNewVersion);
            setYmNewVersion('');
        } else if (progress === 0) {
            setYmStatus(DOWNLOADING);
            setYmProgress(0.5);
        } else {
            setYmStatus(label || DOWNLOADING);
            setYmProgress(Math.max(0, Math.min(1, progress)));
        }
    }, [ymNewVersion]);

    const handleSelfUpdateProgress = useCallback((event, { progress, label }) => {
        if (progress === -1) {
            setSelfStatus(ERROR);
        } else if (progress === 1) {
            setSelfStatus('Установлено');
            setSelfProgress(0);
            setSelfVersion(selfNewVersion);
            setSelfNewVersion('');
        } else if (progress === 0) {
            setSelfStatus(DOWNLOADING);
            setSelfProgress(0.5);
        } else {
            setSelfStatus(label || DOWNLOADING);
            setSelfProgress(Math.max(0, Math.min(1, progress)));
        }
    }, [selfNewVersion]);

    const handleModUpdateProgress = useCallback((event, { progress, label }) => {
        if (progress === -1) {
            setModStatus(ERROR);
        } else if (progress === 1) {
            setModStatus('Установлено');
            setModProgress(0);
            setModVersion(modNewVersion);
            setModNewVersion('');
        } else if (progress === 0) {
            setModStatus(INSTALLING);
            setModProgress(1.1); // intermediate
        } else {
            setModStatus(label || INSTALLING);
            setModProgress(Math.max(0, Math.min(1, progress)));
        }
    }, [modNewVersion]);

    const handleInstallAllUpdates = useCallback(() => {
        useSendInstallAllUpdates();
    }, []);

    const handleInstallSelfUpdate = useCallback(() => {
        useSendInstallSelfUpdate();
    }, []);

    const getVersionDisplay = (version, newVersion) => {
        if (newVersion) {
            return `v${version} -> v${newVersion}`;
        }
        return version ? `v${version}` : '';
    };

    const handleYMCheckStarted = useCallback((event, args) => {
        setYmStatus(CHECKING_UPDATES);
        setYmProgress(1.1); // intermediate
    }, []);

    const handleSelfCheckStarted = useCallback((event, args) => {
        setSelfStatus(CHECKING_UPDATES);
        setSelfProgress(1.1); // intermediate
    }, []);

    const handleModCheckStarted = useCallback((event, args) => {
        setModStatus(CHECKING_UPDATES);
        setModProgress(1.1); // intermediate
    }, []);

    const handleYMCheckFailed = useCallback((event, { error }) => {
        setYmStatus(CHECK_FAILED);
        setYmProgress(0);
    }, []);

    const handleSelfCheckFailed = useCallback((event, { error }) => {
        setSelfStatus(CHECK_FAILED);
        setSelfProgress(0);
    }, []);

    const handleModCheckFailed = useCallback((event, { error }) => {
        setModStatus(CHECK_FAILED);
        setModProgress(0);
    }, []);

    useEffect(() => {
        const offYMStatus = useOnYMUpdaterStatus(handleYMUpdaterStatus);
        const offSelfStatus = useOnSelfUpdaterStatus(handleSelfUpdaterStatus);
        const offModStatus = useOnModUpdaterStatus(handleModUpdaterStatus);

        const offYMCheckStarted = useOnYMUpdaterCheckStarted(handleYMCheckStarted);
        const offSelfCheckStarted = useOnSelfUpdaterCheckStarted(handleSelfCheckStarted);
        const offModCheckStarted = useOnModUpdaterCheckStarted(handleModCheckStarted);

        const offYMCheckFailed = useOnYMUpdaterCheckFailed(handleYMCheckFailed);
        const offSelfCheckFailed = useOnSelfUpdaterCheckFailed(handleSelfCheckFailed);
        const offModCheckFailed = useOnModUpdaterCheckFailed(handleModCheckFailed);

        const offYMProgress = useOnYMUpdateProgress(handleYMUpdateProgress);
        const offSelfProgress = useOnSelfUpdateProgress(handleSelfUpdateProgress);
        const offModProgress = useOnModUpdateProgress(handleModUpdateProgress);

        return () => {
            offYMStatus();
            offSelfStatus();
            offModStatus();
            offYMCheckStarted();
            offSelfCheckStarted();
            offModCheckStarted();
            offYMCheckFailed();
            offSelfCheckFailed();
            offModCheckFailed();
            offYMProgress();
            offSelfProgress();
            offModProgress();
        };
    }, [
        handleYMUpdaterStatus,
        handleSelfUpdaterStatus,
        handleModUpdaterStatus,
        handleYMCheckStarted,
        handleSelfCheckStarted,
        handleModCheckStarted,
        handleYMCheckFailed,
        handleSelfCheckFailed,
        handleModCheckFailed,
        handleYMUpdateProgress,
        handleSelfUpdateProgress,
        handleModUpdateProgress,
    ]);

    return <div className="MainPage_root">
        <StatusWidget
            name={'Яндекс Музыка'}
            status={ymStatus}
            progress={ymProgress}
            version={getVersionDisplay(ymVersion, ymNewVersion)}
            icon={'ym_logo'}
            isUpdateAvailable={ymStatus === UPDATE_AVAILABLE}
            onInstallClick={handleInstallAllUpdates}
        />
        <StatusWidget
            name={'Патчер'}
            status={selfStatus}
            progress={selfProgress}
            version={getVersionDisplay(selfVersion, selfNewVersion)}
            icon={'logo'}
            isUpdateAvailable={selfStatus === UPDATE_AVAILABLE}
            onInstallClick={handleInstallSelfUpdate}
        />
        <StatusWidget
            name={'Мод'}
            status={modStatus}
            progress={modProgress}
            version={getVersionDisplay(modVersion, modNewVersion)}
            icon={'logo'}
            isUpdateAvailable={modStatus === UPDATE_AVAILABLE}
            onInstallClick={handleInstallAllUpdates}
        />
    </div>
}

export default MainPage;
