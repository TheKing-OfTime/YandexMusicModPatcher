import React, { useState } from 'react';
import Icon from '../ui/Icon.jsx';
import '../../styles/LoadingPage.css';

function LoadingPage ({disappear=false}) {

    const [isDisappeared, setIsDisappeared] = useState(false);

    if (isDisappeared) {
        return;
    }

    if (disappear) {
        setTimeout(() => {
            setIsDisappeared(true);
        }, 300); // Задержка перед исчезновением страницы загрузки
    }

    return (
        <div className={`LoadingPage ${disappear ? 'disappear' : ''}`}>
            <Icon name="logo" className="LoadingPageIcon pulsating"/>
            <h1 className="LoadingPageTitle">Starting...</h1>
        </div>
    )
}

export default LoadingPage;
