import * as React from 'react';
import '../styles/TextInput.css';

function TextInput({ value, onChange = () => {}, placeholder = '', disabled = false, className = '' }) {
    return (
        <input
            type="text"
            className={`TextInput ${className}`}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
        />
    );
}

export default TextInput;