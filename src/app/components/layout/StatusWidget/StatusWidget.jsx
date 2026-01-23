import React from 'react';

import ProgressBar from '../../ui/ProgressBar.jsx';
import Icon from '../../ui/Icon.jsx';
import '../../../styles/StatusWidget.css';


export default function StatusWidget({name, progress, status, version, icon= undefined}) {

    return (
        <div className="StatusWidget_root">
            { icon && <Icon name={ icon } size={ 65 }/> }
            <div className="StatusWidget_container">
                <div className="StatusWidget_label" id="nameLabel">
                    <span>{name}</span>
                </div>
                <ProgressBar progress={progress} color={"#5865F2"} height={'10px'} />
                <div className="StatusWidget_label" id="metaLabel">
                    <span>{status}</span>
                    <span>{version}</span>
                </div>
            </div>
        </div>
    )
}
