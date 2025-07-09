import React, { useEffect, useState } from "react";
import '../../styles/Toggle.css';


export default function Toggle({ label, description, onChange, checked = false, disabled = false, className = '' }) {
    const [isChecked, setIsChecked] = useState(checked);
    const [finalDescription, setFinalDescription] = useState(Array.isArray(description) ? description[checked ? 1 : 0] : description);

    const handleToggle = () => {
        if (!disabled) {
            setIsChecked(!isChecked);
            onChange(!isChecked);
            setFinalDescription(Array.isArray(description) ? description[!isChecked ? 1 : 0] : description);
        }
    };

    useEffect(() => {
        setIsChecked(checked);
    }, [checked]);

    return (
    <div className={`Toggle ${className}`}>
        <label className={`Toggle_label${disabled ? ' Toggle_disabled' : ''}`}>
            <div className="Toggle_label_container">
                {label && <span className="Toggle_label_text">{label}</span>}
                {finalDescription && <span className="Toggle_label_description">{finalDescription}</span>}
            </div>
            <input
            type="checkbox"
            className="Toggle_input"
            checked={isChecked}
            onChange={handleToggle}
            disabled={disabled}
            />
            <span className="Toggle_slider"/>
        </label>
    </div>
    );
}
