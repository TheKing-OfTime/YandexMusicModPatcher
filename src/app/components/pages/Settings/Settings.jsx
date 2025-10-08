import React, { useCallback, useContext, useEffect, useState } from "react";
import '../../../styles/SettingsPage.css';

import Dropdown from "../../ui/Dropdown.jsx";
import Toggle from "../../ui/Toggle.jsx";
import InlinePathChooser from '../../layout/InlinePathChooser.jsx';
import InlineButton from '../../ui/InlineButton.jsx';

import { StateContext } from "../../StateContext.jsx";
import { useOnExplorerDialogResponse, useSendClearCaches, useSendOpenExplorerDialog, useSendSetCustomYmPath, useSendUpdateState } from "../../Events.jsx";


function SettingsList({children}) {
    return (
        <ul className="SettingsList">
            {children}
        </ul>
    )
}

function SettingsListItem({children}) {
    return (
        <li className="SettingsListItem settings_font">
            {children}
        </li>
    )
}

// TODO: Сделать секции для настроек
// function SettingsSection({label, children}) {
//     return (
//         <div className="SettingsSection">
//             {label && <h2 className="SettingsSection_label settings_font">{label}</h2>}
//             <div className="SettingsSection_content">
//                 {children}
//             </div>
//         </div>
//     )
// }

function SettingsFooter() {
    const PLATFORMS = {
        win32: 'Windows',
        darwin: 'macOS',
        linux: 'Linux',
    }

    const sendClearCaches = useCallback(() => {
        useSendClearCaches();
    }, [])


    return (
        <div className="SettingsFooter settings_font">
            <div className="SettingsFooter_info_container">
                <span className="SettingsFooterItem">YandexMusicModPatcher v{window.CONSTANTS.CONFIG_APP_VERSION}</span>
                <span className="SettingsFooterItem">{PLATFORMS[window.CONSTANTS.PLATFORM] ?? window.CONSTANTS.PLATFORM} {window.CONSTANTS.ARCH}</span>
                <span className="SettingsFooterItem">by @TheKingOfTime</span>
            </div>
            <div className="SettingsFooter_actions_container">
                <InlineButton label="Отчистить Кеш" variant="secondary" onClick={sendClearCaches}/>
            </div>
        </div>
    )
}

function SettingsPage() {

    const state = useContext(StateContext);

    const options = [
        { label: 'Полный', id: 'default', description: 'Полноценная модификация со всеми функциями' },
        { label: 'Только девтулзы', id: 'devtoolsOnly', description: "Автоматическая модификация. Только девтулзы." },
    ];

    const [selectedType, setSelectedType] = useState(options.find((option) => option.id === state.patchType) ?? options[0]);
    const [useZip, setUseZip] = useState(state.useZIP ?? true);
    const [keepCache, setKeepCache] = useState(state.keepCache ?? true);
    const [updatesControl, setUpdatesControl] = useState(state.controlYMUpdates ?? true);
    const [updatePatcher, setUpdatePatcher] = useState(state.autoUpdate ?? true);
    const [customYMPath, setCustomYMPath] = useState(state.customYMPath ?? '');

    const handleSelect = useCallback((option) => {
        setSelectedType(option);
        useSendUpdateState({ key: 'patchType', value: option.id });
        console.log('Selected:', option);
    }, []);

    const handleUpdatesControlToggle = useCallback((enabled) => {
        setUpdatesControl(enabled);
        useSendUpdateState({ key: 'controlYMUpdates', value: enabled });
        console.log('Toggled controlYMUpdates:', enabled);
    }, []);

    const handleUpdatePatcherToggle = useCallback((enabled) => {
        setUpdatePatcher(enabled);
        useSendUpdateState({ key: 'autoUpdate', value: enabled });
        console.log('Toggled autoUpdate:', enabled);
    }, []);

    const handleUseZipToggle = useCallback((enabled) => {
        setUseZip(enabled);
        useSendUpdateState({ key: 'useZIP', value: enabled });
        console.log('Toggled useZIP:', enabled);
    }, []);

    const handleKeepCacheToggle = useCallback((enabled) => {
        setKeepCache(enabled);
        useSendUpdateState({ key: 'keepCache', value: enabled });
        console.log('Toggled keepCache:', enabled);
    }, []);

    const sendOpenExploreDialog = useCallback(() => {
        useSendOpenExplorerDialog();
    }, [])

    const handleExplorerDialogResponse = useCallback((event, args) => {
        setCustomYMPath(args.path);
        useSendSetCustomYmPath({ path: args.path });
        useSendUpdateState({ key: 'customYMPath', value: args.path });
    }, []);

    useEffect(() => {
        const offExplorerDialogResponse = useOnExplorerDialogResponse(handleExplorerDialogResponse);
        return () => {
            offExplorerDialogResponse();
        }
    }, []);

    return (
        <div className="SettingsPage scroll_enabled">
            <SettingsList>
                <SettingsListItem>
                    <InlinePathChooser
                        label="Пользовательский путь до Яндекс Музыки"
                        description="Используйте если патчер не нашёл путь до Яндекс Музыки сам"
                        path={customYMPath}
                        onExploreClick={sendOpenExploreDialog}
                    />
                </SettingsListItem>
                <SettingsListItem>
                    <Dropdown
                        label="Канал релизов" options={options}
                        onSelect={handleSelect} defaultOption={selectedType}
                    />
                </SettingsListItem>
                <SettingsListItem>
                    <Toggle
                        checked={useZip} label="Использовать сжатые asar"
                        description="Ускоряет скачивание файлов модификации" onChange={handleUseZipToggle}
                    />
                </SettingsListItem>
                <SettingsListItem>
                    <Toggle
                        checked={keepCache} label="Оставлять кеш после патча"
                        description="В некоторых случаях пропускает скачивание файлов, если они уже есть в кеше" onChange={handleKeepCacheToggle}
                    />
                </SettingsListItem>
                <SettingsListItem>
                    <Toggle
                        checked={updatesControl} label="Контроль обновлений ЯМ"
                        description={["Обновления Яндекс Музыки контролирует сама Яндекс Музыка", "Обновления Яндекс Музыки контролирует патчер"]}
                        disabled={true}
                        onChange={handleUpdatesControlToggle}
                    />
                </SettingsListItem>
                <SettingsListItem>
                    <Toggle
                        checked={updatePatcher} label="Обновлять патчер автоматически"
                        description="Обновлять ли патчер автоматически. Рекомендуется не выключать"
                        disabled={true}
                        onChange={handleUpdatePatcherToggle}
                    />
                </SettingsListItem>
            </SettingsList>
            <SettingsFooter/>
        </div>
    )
}

export default SettingsPage;
