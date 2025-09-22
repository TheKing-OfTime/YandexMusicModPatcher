import React from 'react';
import '../../styles/InlinePathChooser.css';

import TextInput from '../ui/TextInput.jsx';
import InlineButton from '../ui/InlineButton.jsx';
import Tooltip from '../ui/Tooltip.jsx';


function InlinePathChooser({ label, description, path, onExploreClick, pathTextboxDisabled=true, ...props }) {

    const withLabel = label ? <label className={`InlinePathChooser_label`}>{label}</label> : undefined;
    const withDescription = description ? <span className={`InlinePathChooser_description`}>{description}</span> : undefined;
    const withLabelContainer = withLabel || withDescription ? <div className="InlinePathChooser_label_container">{withLabel}{withDescription}</div> : undefined;

    return (
        <div className="InlinePathChooser_container">
            {withLabelContainer}
            <div className="InlinePathChooser" {...props}>
                <TextInput value={path} disabled={pathTextboxDisabled}/>
                <Tooltip label="Обзор" direction="top">
                    <InlineButton onClick={onExploreClick} icon="folder" variant="secondary"></InlineButton>
                </Tooltip>
            </div>
        </div>
    )
}

export default InlinePathChooser;
