import React from 'react';

function Icon({ name, size = 24, color = 'currentColor', ...props }) {
    return (
        <svg
            width={size}
            height={size}
            fill={color}
            aria-hidden="true"
            {...props}
        >
            <use xlinkHref={`/static/icons/sprite.svg#${name}`} />
        </svg>
    );
}

export default Icon;
