import * as React from 'react';
import TitleBarButton from './TitleBarButton.jsx';

function TitleBar() {
    return (
        <header className="TitleBar">
            <div>
                <TitleBarButton variant="minimize"/>
                <TitleBarButton variant="maximize"/>
                <TitleBarButton variant="quit"/>
            </div>
        </header>
    )
}

export default TitleBar;
