import React, { useCallback, useEffect, useState } from 'react';
import TitleBarButton from '../ui/TitleBarButton.jsx';
import '../../styles/TitleBar.css';
import Icon from '../ui/Icon.jsx';
import { useOnShowToast } from '../Events.jsx';


function TitleBar() {
    const platform = window?.CONSTANTS?.PLATFORM ?? 'win32';

    const [toastLabel, setToastLabel] = useState("Toast!");
    const [toastShown, setToastShown] = useState(false);


    useEffect(() => {
        const offShowToast = useOnShowToast((event, args) => {
            setToastLabel(args.label);
            setToastShown(true);

            setTimeout(() => setToastShown(false), args.duration ?? 3000);
        })

        return () => {
            offShowToast()
        }
    }, []);

    if (platform === 'darwin') {
        return (
        <header className="TitleBar TitleBar_darwin">
            <div className={ `TitleBar_app_name_container ${toastShown ? 'TitleBar_app_name_container_shifted' : undefined}` }>
                <p className="TitleBar_toast">{toastLabel}</p>
                <p className="TitleBar_app_name"><Icon name="logo" className="TitleBar_app_logo_darwin"/>YandexMusicModPatcher</p>
            </div>
            <div>
            </div>
        </header>
        )
    }

    return (
    <header className="TitleBar">
        <Icon name="logo" className="TitleBar_app_logo"/>
        <div className={ `TitleBar_app_name_container ${toastShown ? 'TitleBar_app_name_container_shifted' : undefined}` }>
            <p className="TitleBar_toast">{toastLabel}</p>
            <p className="TitleBar_app_name">YandexMusicModPatcher</p>
        </div>
        <div>
            <TitleBarButton variant="minimize"/>
            <TitleBarButton variant="maximize"/>
            <TitleBarButton variant="quit"/>
        </div>
    </header>
    )
}

export default TitleBar;
