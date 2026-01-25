import React from 'react';
import '../../../styles/MainPage.css'
import YMWidget from '../../layout/StatusWidget/widgets/YMWidget.jsx';
import SelfWidget from '../../layout/StatusWidget/widgets/SelfWidget.jsx';
import ModWidget from '../../layout/StatusWidget/widgets/ModWidget.jsx';

function MainPage () {
    return <div className="MainPage_root">
        <YMWidget />
        <SelfWidget />
        <ModWidget />
    </div>
}

export default MainPage;
