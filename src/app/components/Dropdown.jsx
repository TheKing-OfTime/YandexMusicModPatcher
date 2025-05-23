import React, { useState, useEffect, useCallback, useRef } from "react";
import "../styles/Dropdown.css";

export default function Dropdown({ label, description, options, defaultOption, onSelect, disabled = false, className = '', placeholder = 'Выберите...' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(defaultOption);
    const [secondaryDescription, setSecondaryDescription] = useState(defaultOption?.description);

    const dropdownRef = useRef(null);

    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    const handleSelect = (option) => {
        setSelected(option);
        onSelect(option);
        setSecondaryDescription(option.description);
        setIsOpen(false);
        dropdownRef.current.blur();
    };

    const handleClickOutside = useCallback((event) => {
        if (isOpen && !event.target.closest('.Dropdown_toggle')) {
            event.stopPropagation();
            event.preventDefault();
            setIsOpen(false);
            dropdownRef.current.blur();
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
            <div className="Dropdown_container">
                <div className="Dropdown_label_container">
                    {label && <span className="Dropdown_label">{label}</span>}
                    {(description ?? secondaryDescription) && <span className="Dropdown_description">{description ?? secondaryDescription}</span>}
                </div>
                <button className={`Dropdown_toggle${!selected ? ' Dropdown_placeholder' : ''}`} onClick={handleToggle} disabled={disabled} ref={dropdownRef}>
                    {selected?.label || placeholder}
                    {isOpen && (
                        <ul className="Dropdown_menu">
                            {options.map((option, index) => (
                                <li key={index} className="Dropdown_item" onClick={() => handleSelect(option)}>
                                    { option?.label }
                                </li>
                            ))}
                        </ul>
                    )}
                </button>
            </div>
        </div>
    );
}