import React, { useState, useEffect, useCallback } from "react";
import "../styles/Dropdown.css";

export default function Dropdown({ options, defaultOption, onSelect, disabled = false, className = '', placeholder = 'Выберите...' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(defaultOption);

    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    const handleSelect = (option) => {
        setSelected(option);
        onSelect(option);
        setIsOpen(false);
    };

    const handleClickOutside = useCallback((event) => {
        if (isOpen && !event.target.closest('.Dropdown')) {
            setIsOpen(false);
        }
    }, [isOpen]);

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [handleClickOutside]);

    return (
        <div className={`Dropdown ${className}`}>
            <button className={`Dropdown_toggle${!selected ? ' Dropdown_placeholder' : ''}`} onClick={handleToggle} disabled={disabled}>
                {selected?.label || placeholder}
            </button>
            {isOpen && (
                <ul className="Dropdown_menu">
                    {options.map((option, index) => (
                        <li key={index} className="Dropdown_item" onClick={() => handleSelect(option)}>
                            { option?.label }
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}