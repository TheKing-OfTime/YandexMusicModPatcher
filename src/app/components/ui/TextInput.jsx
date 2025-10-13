import React, { useEffect, useState } from 'react';
import '../../styles/TextInput.css';
import Icon from './Icon.jsx';


function TextInput({ value, setValue, onChange = () => {}, placeholder = '', disabled = false, className = '', showClearButton = false }) {

    const [shouldShowClearButton, setShouldShowClearButton] = useState(showClearButton && value);

    useEffect(() => {
        setShouldShowClearButton(showClearButton && value)
    }, [value])

    return <div className='TextInput_wrapper'>
        { disabled ? <input
            type="text"
            className={ `TextInput ${ className }` }
            value={ value }
            onChange={ e => onChange(e.target.value) }
            placeholder={ placeholder }
            disabled={ disabled }
        /> : <input
            type="text"
            className={ `TextInput ${ className }` }
            defaultValue={ value }
            onChange={ e => {
                setValue(e.target.value);
                setShouldShowClearButton(showClearButton && e.target.value);
                onChange(e.target.value);
            } }
            placeholder={ placeholder }
            disabled={ disabled }
        />}
        { shouldShowClearButton && <button
            className='TextInput_clearButton'
            onClick={ () => {
                setValue('');
            } }
        >
            <Icon name="titlebar_quit" size={ 12 }/>
        </button> }
    </div>;
}

export default TextInput;
