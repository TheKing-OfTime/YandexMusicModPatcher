import React, { useState, useEffect, useCallback, useContext } from "react";
import '../styles/SettingsPage.css';

import Dropdown from "./Dropdown.jsx";
import Toggle from "./Toggle.jsx";
import { StateContext } from "./StateContext.jsx";

function SettingsPage() {

    const state = useContext(StateContext);

    const options = [
        { label: 'Полный', id: 'default', description: 'Полноценная модификация со всеми функциями' },
        { label: 'Только девтулзы', id: 'devtoolsOnly', description: "Автоматическая модификация. Только девтулзы."},
    ];

    const [selectedType, setSelectedType] = useState(options.find((option) => option.id === state.patchType) ?? options[0]);
    const [useZip, setUseZip] = useState(state.useZIP ?? true);
    const [updatesControl, setUpdatesControl] = useState(state.controlYMUpdates ?? true);
    const [updatePatcher, setUpdatePatcher] = useState(state.autoUpdate ?? true);

    const handleSelect = useCallback((option) => {
        setSelectedType(option);
        window.desktopEvents.send('UPDATE_STATE', {key: 'patchType', value: option.id});
        console.log('Selected:', option);
    }, []);

    const handleUpdatesControlToggle = useCallback((enabled) => {
        setUpdatesControl(enabled);
        window.desktopEvents.send('UPDATE_STATE', {key: 'controlYMUpdates', value: enabled});
        console.log('Toggled:', enabled);
    }, []);

    const handleUpdatePatcherToggle = useCallback((enabled) => {
        setUpdatePatcher(enabled);
        window.desktopEvents.send('UPDATE_STATE', {key: 'autoUpdate', value: enabled});
        console.log('Toggled:', enabled);
    }, []);

    const handleUpdateUseZipToggle = useCallback((enabled) => {
        setUseZip(enabled);
        window.desktopEvents.send('UPDATE_STATE', {key: 'useZIP', value: enabled});
        console.log('Toggled:', enabled);
    }, []);

    return (
        <div className="SettingsPage scroll_enabled">
            <ul className="SettingItemList">
                <li>
                    <Dropdown className="width100percent" label="Канал релизов" options={options} onSelect={handleSelect} defaultOption={selectedType} />
                </li>
                <li>
                    <Toggle className="width100percent" checked={useZip} label="Использовать сжатые asar" description="Ускоряет скачивание файлов модификации" onChange={handleUpdateUseZipToggle} />
                </li>
                <li>
                    <Toggle className="width100percent" checked={updatesControl} label="Контроль обновлений ЯМ" description={["Обновления Яндекс Музыки контролирует сама Яндекс Музыка", "Обновления Яндекс Музыки контролирует патчер"]} onChange={handleUpdatesControlToggle} />
                </li>
                <li>
                    <Toggle className="width100percent" checked={updatePatcher} label="Обновлять патчер автоматически" description="Обновлять ли патчер автоматически. Рекомендуется не выключать" onChange={handleUpdatePatcherToggle} />
                </li>
            </ul>
        </div>
    )
}

export default SettingsPage;
