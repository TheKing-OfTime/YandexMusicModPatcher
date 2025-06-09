import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import TitleBar from './TitleBar.jsx'
import MainProgressBar from './MainProgressBar.jsx'
import ActionsBar from "./ActionsBar.jsx";
import LogCard from './LogCard.jsx';
import CustomPathModal from "./CustomPathModal.jsx";
import MacPermissionsModal from "./MacPermissionsModal.jsx";
import WindowsLegacyAppModal from "./WindowsLegacyAppModal.jsx";
import SettingsPage from "./SettingsPage.jsx";

function App() {

    const [ isSettingsOpen, setIsSettingsOpen ] = useState(false);
    const [ logEntries, setLogEntries ] = useState([]);

    return (
        <>
            <TitleBar platform={window.PLATFORM}/>
            <main className="App">
                <MainProgressBar/>
                {
                    isSettingsOpen
                        ? <SettingsPage/>
                        : <LogCard logEntries={logEntries} setLogEntries={setLogEntries} />
                }
                <ActionsBar isSettingsOpen={isSettingsOpen} setIsSettingsOpen={setIsSettingsOpen} />
            </main>
            <CustomPathModal/>
            <MacPermissionsModal/>
            <WindowsLegacyAppModal/>
        </>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(
    <>
        <App/>
    </>
);
