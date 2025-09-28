import React, { useState } from 'react';
import '../../styles/Tooltip.css';


const directions = {
    top: 'Tooltip_top',
    right: 'Tooltip_right',
    bottom: 'Tooltip_bottom',
    left: 'Tooltip_left',
};

export default function Tooltip({ label, direction = 'top', enabled=true, onMouseEnter=undefined, onMouseLeave=undefined, children }) {
    const [visible, setVisible] = useState(false);



    return (
        <span
            className="Tooltip_wrapper"
            onMouseEnter={() => {
                if (enabled) onMouseEnter?.();
                return setVisible(enabled);
            }}
            onMouseLeave={() => {
                onMouseLeave?.();
                return setVisible(false);
            }}
        >
        { children }
        {
            <span className={ `Tooltip_box ${ directions[direction] || directions.top } ${visible ? 'Tooltip_box--visible' : ''}` }>
                { label }
            </span>
        }
    </span>
    );
}
