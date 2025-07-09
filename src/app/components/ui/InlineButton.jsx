import * as React from 'react';
import '../../styles/InlineButton.css';


function InlineButton({ children, onClick, disabled = false, className = '', type = 'button' }) {
    return (
        <button
            type={type}
            className={`InlineButton ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

export default InlineButton;
