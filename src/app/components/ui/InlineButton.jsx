import * as React from 'react';
import '../../styles/InlineButton.css';

import Icon from './Icon.jsx';

const variants = {
    primary: 'PrimaryButton',
    secondary: 'SecondaryButton',
    danger: 'DangerButton',
};

const getVariant = (variant) => variants[variant] ?? variants['primary'];

function InlineButton({ onClick, label=undefined, icon=undefined,  variant = "primary", disabled = false, className = '', type = 'button' }) {
    return (
        <button
            type={ type }
            className={ `InlineButton ${ getVariant(variant) } ${ className }` }
            onClick={ onClick }
            disabled={ disabled }
        >
            {icon && <Icon name={icon} size={24} className="InlineButton_icon" />}
            {label && <span className="InlineButton_label">{label}</span>}
        </button>
    );
}

export default InlineButton;
