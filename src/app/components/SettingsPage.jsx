import React, { useState, useEffect, useCallback } from "react";
import '../styles/SettingsPage.css';

import Dropdown from "./Dropdown.jsx";
import Toggle from "./Toggle.jsx";

function SettingsPage() {

    const [selected, setSelected] = useState(null);
    const [updatesControl, setUpdatesControl] = useState(true);
    const [updatePatcher, setUpdatePatcher] = useState(true);

    const options = [
        { label: 'Полный', id: 'default', description: 'Полноценная модификация со всеми функциями' },
        { label: 'Только девтулзы', id: 'devtoolsOnly', description: "Автоматическая модификация. Только девтулзы."},
    ];

    const handleSelect = useCallback((option) => {
        setSelected(option);
        console.log('Selected:', option);
    }, []);

    const handleUpdatesControlToggle = useCallback((enabled) => {
        setUpdatesControl(enabled);
        console.log('Toggled:', enabled);
    }, []);

    const handleUpdatePatcherToggle = useCallback((enabled) => {
        setUpdatePatcher(enabled);
        console.log('Toggled:', enabled);
    }, []);

    return (
        <div className="SettingsPage scroll_enabled">
            <ul className="SettingItemList">
                <li>
                    <Dropdown className="width100percent" label="Канал релизов" options={options} onSelect={handleSelect} defaultOption={options[0]} />
                </li>
                <li>
                    <Toggle className="width100percent" checked={true} label="Использовать сжатые asar" description="Ускоряет скачивание файлов модификации" onChange={(value) => console.log('Toggle:', value)} />
                </li>
                <li>
                    <Toggle className="width100percent" checked={true} label="Контроль обновлений ЯМ" description={["Обновления Яндекс Музыки контролирует сама Яндекс Музыка", "Обновления Яндекс Музыки контролирует патчер"]} onChange={handleUpdatesControlToggle} />
                </li>
                <li>
                    <Toggle className="width100percent" checked={true} label="Обновлять патчер автоматически" description="Обновлять ли патчер автоматически. Рекомендуется не выключать" onChange={handleUpdatePatcherToggle} />
                </li>
            </ul>
        </div>
    )
}

export default SettingsPage;