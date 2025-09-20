import React, { useState } from 'react';
import '../../styles/Tooltip.css';


const directions = {
    top: 'Tooltip_top',
    right: 'Tooltip_right',
    bottom: 'Tooltip_bottom',
    left: 'Tooltip_left',
};

export default function Tooltip({ label, direction = 'top', enabled=true, children }) {
    const [visible, setVisible] = useState(false);



    return (
        <span
            className="Tooltip_wrapper"
            onMouseEnter={() => setVisible(enabled) }
            onMouseLeave={() => setVisible(false) }
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
