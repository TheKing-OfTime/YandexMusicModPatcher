import React, { useState, useEffect, useCallback } from "react";
import '../styles/SettingsPage.css';

import Dropdown from "./Dropdown.jsx";

function SettingsPage() {

    const [selected, setSelected] = useState(null);

    const options = [
        { label: 'Модификация', id: 'default' },
        { label: 'Только девтулзы', id: 'devtoolsOnly' },
    ];

    const handleSelect = useCallback((option) => {
        setSelected(option);
        console.log('Selected:', option);
    }, []);

    return (
        <div className="SettingsPage scroll_enabled">
            <ul className="SettingItemList">
                <li>
                    <Dropdown options={options} onSelect={handleSelect} defaultOption={options[0]} />
                </li>
            </ul>
        </div>
    )
}

export default SettingsPage;