import React from 'react';
import TextInput from '../ui/TextInput.jsx';
import InlineButton from '../ui/InlineButton.jsx';
import '../../styles/InlinePathChooser.css';


function InlinePathChooser({ path, onExploreClick, pathTextboxDisabled=true, ...props }) {

    return (
        <div className="InlinePathChooser" {...props}>
            <TextInput value={path} disabled={pathTextboxDisabled}/>
            <InlineButton onClick={onExploreClick}>Обзор</InlineButton>
        </div>
    )
}

export default InlinePathChooser;
