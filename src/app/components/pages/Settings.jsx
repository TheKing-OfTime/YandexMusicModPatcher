import React, { useCallback, useContext, useEffect, useState } from "react";
import '../../styles/SettingsPage.css';

import Dropdown from "../ui/Dropdown.jsx";
import Toggle from "../ui/Toggle.jsx";
import InlinePathChooser from '../layout/InlinePathChooser.jsx';
import { StateContext } from "../StateContext.jsx";
import {
    useOnExplorerDialogResponse,
    useSendOpenExplorerDialog,
    useSendSetCustomYmPath,
    useSendUpdateState
} from "../Events.jsx";


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
        <ul className="SettingItemList">
            <li>
                <div className="width100percent" style={{ padding: '8px', gap: '8px', display: 'flex', flexDirection: 'column' }}>
                    <InlinePathChooser
                        label="Пользовательский путь до Яндекс Музыки"
                        description="Используйте если патчер не нашёл путь до Яндекс Музыки сам"
                        path={customYMPath}
                        onExploreClick={sendOpenExploreDialog}
                    />
                </div>
            </li>
            <li>
                <Dropdown className="width100percent" label="Канал релизов" options={options}
                          onSelect={handleSelect} defaultOption={selectedType}/>
            </li>
            <li>
                <Toggle className="width100percent" checked={useZip} label="Использовать сжатые asar"
                        description="Ускоряет скачивание файлов модификации" onChange={handleUpdateUseZipToggle}/>
            </li>
            <li>
                <Toggle className="width100percent" checked={updatesControl} label="Контроль обновлений ЯМ"
                        description={["Обновления Яндекс Музыки контролирует сама Яндекс Музыка", "Обновления Яндекс Музыки контролирует патчер"]}
                        onChange={handleUpdatesControlToggle}/>
            </li>
            <li>
                <Toggle className="width100percent" checked={updatePatcher} label="Обновлять патчер автоматически"
                        description="Обновлять ли патчер автоматически. Рекомендуется не выключать"
                        onChange={handleUpdatePatcherToggle}/>
            </li>
        </ul>
    </div>
    )
}

export default SettingsPage;
