import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import TitleBar from './layout/TitleBar.jsx'
import MainProgressBar from './layout/MainProgressBar.jsx'
import ActionsBar from "./layout/ActionsBar.jsx";
import ModalsContainer from "./layout/modals/ModalsContainer.jsx";
import { StateProvider } from "./StateContext.jsx";
import {
    useOnIsInstallPossibleResponse,
    useOnStateInitiated,
    useSendInit,
    useSendReady,
    useSendReadyToPatch
} from "./Events.jsx";

import LogsPage from './pages/Logs.jsx';
import SettingsPage from "./pages/Settings.jsx";
import LoadingPage from './pages/Loading.jsx';

function App() {

    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState('main');
    const [logEntries, setLogEntries] = useState([]);

    useEffect(() => {
        useSendInit({});
        const OffStateInitiated = useOnStateInitiated(()=> {
            setTimeout(()=>{
                useSendReady()
                setIsLoading(false);
            }, 1300); // Задержка для предотвращения мерцания. Будет убрана в будущем, если загрузка будет более долгой
        });
        const OffIsInstallPossibleResponse = useOnIsInstallPossibleResponse(() =>{
            useSendReadyToPatch();
        })

        return () => {
            OffStateInitiated();
            OffIsInstallPossibleResponse();
        }
    }, []);


    const renderPage = () => {
        switch (currentPage) {
            case 'settings':
                return <SettingsPage/>;
            case 'logs':
                return <LogsPage logEntries={logEntries} setLogEntries={setLogEntries}/>;
            case 'main':                                                                    //TODO Поменять на main страницу когда она будет готова
                return <LogsPage logEntries={logEntries} setLogEntries={setLogEntries}/>;
        }
    };

    return (
        <StateProvider>
            <TitleBar platform={window.PLATFORM}/>
            {
                isLoading
                ? <LoadingPage/>
                : (<>
                    <main className="App">
                        <MainProgressBar/>
                        {renderPage()}
                        <ActionsBar currentPage={currentPage} setCurrentPage={setCurrentPage}/>
                    </main>
                    <ModalsContainer/>
                    <LoadingPage disappear={true}/>
                </>)
            }
        </StateProvider>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(
<>
    <App/>
</>
);
