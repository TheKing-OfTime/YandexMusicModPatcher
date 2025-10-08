import React, { useCallback, useContext, useEffect, useState } from "react";
import '../../../styles/SettingsPage.css';

import Dropdown from "../../ui/Dropdown.jsx";
import Toggle from "../../ui/Toggle.jsx";
import InlinePathChooser from '../../layout/InlinePathChooser.jsx';
import { StateContext } from "../../StateContext.jsx";
import { useOnExplorerDialogResponse, useSendOpenExplorerDialog, useSendSetCustomYmPath, useSendUpdateState } from "../../Events.jsx";


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

    return (
        <div className="SettingsFooter settings_font">
            <span className="SettingsFooterItem">YandexMusicModPatcher v{window.CONSTANTS.CONFIG_APP_VERSION}</span>
            <span className="SettingsFooterItem">{PLATFORMS[window.CONSTANTS.PLATFORM] ?? window.CONSTANTS.PLATFORM} {window.CONSTANTS.ARCH}</span>
            <span className="SettingsFooterItem">by @TheKingOfTime</span>
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
        console.log('Toggled:', enabled);
    }, []);

    const handleUpdatePatcherToggle = useCallback((enabled) => {
        setUpdatePatcher(enabled);
        useSendUpdateState({ key: 'autoUpdate', value: enabled });
        console.log('Toggled:', enabled);
    }, []);

    const handleUpdateUseZipToggle = useCallback((enabled) => {
        setUseZip(enabled);
        useSendUpdateState({ key: 'useZIP', value: enabled });
        console.log('Toggled:', enabled);
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
                    description="Ускоряет скачивание файлов модификации" onChange={handleUpdateUseZipToggle}
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
