import * as React from 'react';


function TextBox({ children, className = '' }) {
    return (
    <div className={`TextBox ${className}`}>
        {children}
    </div>
    );
}

export default TextBox;
