import * as React from 'react';
import TitleBarButton from '../ui/TitleBarButton.jsx';
import '../../styles/TitleBar.css';
import Icon from '../ui/Icon.jsx';


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
            <p className="TitleBar_app_name">YandexMusicModPatcher</p> {/* TODO: Добавить иконку приложения */}
            <div>
            </div>
        </header>
        )
    }

    return (
    <header className="TitleBar">
        <Icon name="logo" className="TitleBar_app_logo"/>
        <p className="TitleBar_app_name">YandexMusicModPatcher</p>
        <div>
            <TitleBarButton variant="minimize"/>
            <TitleBarButton variant="maximize"/>
            <TitleBarButton variant="quit"/>
        </div>
    </header>
    )
}

export default TitleBar;
