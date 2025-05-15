import React, { useState, useEffect, useCallback } from "react";
import '../styles/Toggle.css';

export default function Toggle({ label, onChange, checked = false, disabled = false, className = '' }) {
    const [isChecked, setIsChecked] = useState(checked);

    const handleToggle = () => {
        if (!disabled) {
            setIsChecked(!isChecked);
            onChange(!isChecked);
        }
    };

    useEffect(() => {
        setIsChecked(checked);
    }, [checked]);

    return (
        <div className={`Toggle ${className}`}>
            <label className={`Toggle_label${disabled ? ' Toggle_disabled' : ''}`}>
                {label && <span className="Toggle_text">{label}</span>}
                <input
                    type="checkbox"
                    className="Toggle_input"
                    checked={isChecked}
                    onChange={handleToggle}
                    disabled={disabled}
                />
                <span className="Toggle_slider" />
            </label>
        </div>
    );
}