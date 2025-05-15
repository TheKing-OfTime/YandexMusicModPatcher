import React, { useState, useEffect, useCallback } from "react";
import '../styles/SettingsPage.css';

import Dropdown from "./Dropdown.jsx";
import Toggle from "./Toggle.jsx";

function SettingsPage() {

    const [selected, setSelected] = useState(null);

    const options = [
        { label: 'Полный', id: 'default', description: 'Полноценная модификация со всеми функциями' },
        { label: 'Только девтулзы', id: 'devtoolsOnly', description: "Автоматическая модификация. Только девтулзы."},
    ];

    const handleSelect = useCallback((option) => {
        setSelected(option);
        console.log('Selected:', option);
    }, []);

    return (
        <div className="SettingsPage scroll_enabled">
            <ul className="SettingItemList">
                <li>
                    <Dropdown className="width100percent" label="Канал релизов" options={options} onSelect={handleSelect} defaultOption={options[0]} />
                </li>
                <li>
                    <Toggle className="width100percent" label="Использовать сжатые asar" onChange={(value) => console.log('Toggle:', value)} />
                </li>
            </ul>
        </div>
    )
}

export default SettingsPage;