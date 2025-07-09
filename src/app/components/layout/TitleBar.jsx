import * as React from 'react';
import TitleBarButton from '../ui/TitleBarButton.jsx';
import '../../styles/TitleBar.css';


function TitleBar() {
    const platform = window?.CONSTANTS?.PLATFORM ?? 'win32';
    const macStyle = {
        justifyContent: 'flex-start',
        padding: '8px',
        display: 'flex',
        height: '33px',
    }

    if (platform === 'darwin') {
        return (
            <header className="TitleBar" style={macStyle}>
                <div>
                </div>
            </header>
        )
    }

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
