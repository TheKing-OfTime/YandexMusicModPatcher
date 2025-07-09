import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import TitleBar from './layout/TitleBar.jsx'
import MainProgressBar from './layout/MainProgressBar.jsx'
import ActionsBar from "./layout/ActionsBar.jsx";
import LogCard from './layout/LogCard.jsx';
import SettingsPage from "./pages/Settings.jsx";
import ModalsContainer from "./layout/modals/ModalsContainer.jsx";
import { StateProvider } from "./StateContext.jsx";
import { useSendReady } from "./Events.jsx";


function App() {

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [logEntries, setLogEntries] = useState([]);

    useEffect(() => {
        useSendReady({});
    }, []);

    return (
    <StateProvider>
        <TitleBar platform={window.PLATFORM}/>
        <main className="App">
            <MainProgressBar/>
            {
                isSettingsOpen
                ? <SettingsPage/>
                : <LogCard logEntries={logEntries} setLogEntries={setLogEntries}/>
            }
            <ActionsBar isSettingsOpen={isSettingsOpen} setIsSettingsOpen={setIsSettingsOpen}/>
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
