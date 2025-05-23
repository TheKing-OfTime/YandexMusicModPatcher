import * as React from 'react';
import TitleBarButton from './TitleBarButton.jsx';
import '../styles/TitleBar.css';

function TitleBar() {
    const platform = window?.CONSTANTS?.PLATFORM ?? 'win32';
    const macStyle = {
        justifyContent: 'flex-start',
        padding: '8px',
        display: 'flex',
    }

    if (platform === 'darwin') {
        return (
            <header className="TitleBar" style={macStyle}>
                <div style={{gap: '4px'}}>
                    <TitleBarButton variant="quit" platform={platform}/>
                    <TitleBarButton variant="minimize" platform={platform}/>
                    <TitleBarButton variant="maximize" platform={platform}/>
                </div>
            </header>
        )
    }

    return (
        <header className="TitleBar">
            <div>
                <TitleBarButton variant="minimize" platform={platform}/>
                <TitleBarButton variant="maximize" platform={platform}/>
                <TitleBarButton variant="quit" platform={platform}/>
            </div>
        </header>
    )
}

export default TitleBar;
