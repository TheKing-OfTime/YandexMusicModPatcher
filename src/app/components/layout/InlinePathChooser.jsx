import React from 'react';
import TextInput from '../ui/TextInput.jsx';
import InlineButton from '../ui/InlineButton.jsx';
import '../../styles/InlinePathChooser.css';


function InlinePathChooser({ label, description, path, onExploreClick, pathTextboxDisabled=true, ...props }) {

    const withLabel = label ? <label className={`InlinePathChooser_label`}>{label}</label> : undefined;
    const withDescription = description ? <span className={`InlinePathChooser_description`}>{description}</span> : undefined;
    const withLabelContainer = withLabel || withDescription ? <div className="InlinePathChooser_label_container">{withLabel}{withDescription}</div> : undefined;

    return (
        <>
            {withLabelContainer}
            <div className="InlinePathChooser" {...props}>
                <TextInput value={path} disabled={pathTextboxDisabled}/>
                <InlineButton onClick={onExploreClick}>Обзор</InlineButton>
            </div>
        </>
    )
}

export default InlinePathChooser;
