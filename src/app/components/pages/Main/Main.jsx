import React from 'react';
import StatusWidget from '../../layout/StatusWidget/StatusWidget.jsx';
import '../../../styles/MainPage.css'

function MainPage () {
    return <div className="MainPage_root">
        <StatusWidget name={'Яндекс Музыка'} status={'Поиск обновлений'} progress={1.1} version={''} icon={'ym_logo'}/>
        <StatusWidget name={'Патчер'} status={'Поиск обновлений'} progress={1.1} version={''} icon={'logo'}/>
        <StatusWidget name={'Мод'} status={'Поиск обновлений'} progress={1.1} version={''} icon={'logo'}/>
    </div>
}

export default MainPage;
