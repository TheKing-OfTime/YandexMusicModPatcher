import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import TitleBar from './layout/TitleBar.jsx'
import MainProgressBar from './layout/MainProgressBar.jsx'
import ActionsBar from "./layout/ActionsBar.jsx";
import LogsPage from './pages/Logs.jsx';
import SettingsPage from "./pages/Settings.jsx";
import ModalsContainer from "./layout/modals/ModalsContainer.jsx";
import { StateProvider } from "./StateContext.jsx";
import { useOnIsInstallPossibleResponse, useSendReady, useSendReadyToPatch } from "./Events.jsx";


function App() {

    const [currentPage, setCurrentPage] = useState('main');
    const [logEntries, setLogEntries] = useState([]);

    useEffect(() => {
        useSendReady({});
        const OffIsInstallPossibleResponse = useOnIsInstallPossibleResponse(() =>{
            useSendReadyToPatch();
        })

        return () => {
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
            <main className="App">
                <MainProgressBar/>
                { renderPage() }
                <ActionsBar currentPage={currentPage} setCurrentPage={setCurrentPage}/>
            </main>
            <ModalsContainer/>
        </StateProvider>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(
<>
    <App/>
</>
);
