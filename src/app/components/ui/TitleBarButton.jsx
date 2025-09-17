import * as React from 'react';
import '../../styles/TitleBar.css';
import Icon from './Icon.jsx';
import { useSendMaximize, useSendMinimize, useSendQuit } from "../Events.jsx";


function TitleBarButtonIcon({ variant }) {
    switch (variant) {
        case 'quit':
            return (
                <Icon
                    name="titlebar_quit" size="10" className="TitleBar_icon"
                />
            );
        case 'minimize':
            return (
                <Icon
                    name="titlebar_minimize" size="10" className="TitleBar_icon"
                />
            );
        case 'maximize':
            return (
                <Icon
                    name="titlebar_maximize" size="10" className="TitleBar_icon"
                />
            );
    }

}

function TitleBarButton({ variant }) {
    const btnVariant = {};
    switch (variant) {
        case 'quit':
            btnVariant.id = 'quit';
            btnVariant.className = 'TitleBar_QuitButton';
            btnVariant.callback = React.useCallback(() => {
                useSendQuit();
            }, [])
            break;
        case 'minimize':
            btnVariant.id = 'minimize';
            btnVariant.className = 'TitleBar_Button';
            btnVariant.callback = React.useCallback(() => {
                useSendMinimize();
            }, [])
            break;
        case 'maximize':
            btnVariant.id = 'maximize';
            btnVariant.className = 'TitleBar_Button';
            btnVariant.callback = React.useCallback(() => {
                useSendMaximize();
            }, [])
            break;
    }


    return (
    <button id={btnVariant.id} className={btnVariant.className} onClick={btnVariant.callback}>
        <TitleBarButtonIcon variant={variant}/>
    </button>
    )
}

export default TitleBarButton;
