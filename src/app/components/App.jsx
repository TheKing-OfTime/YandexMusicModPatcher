import React, {useEffect, useState} from 'react';
import { createRoot } from 'react-dom/client';
import TitleBar from './TitleBar.jsx'
import MainProgressBar from './MainProgressBar.jsx'
import ActionsBar from "./ActionsBar.jsx";
import LogCard from './LogCard.jsx';
import SettingsPage from "./SettingsPage.jsx";
import ModalsContainer from "./ModalsContainer.jsx";
import { StateProvider } from "./StateContext.jsx";

function App() {

    const [ isSettingsOpen, setIsSettingsOpen ] = useState(false);
    const [ logEntries, setLogEntries ] = useState([]);

    useEffect(() => {
        window.desktopEvents.send('READY', {})
    }, []);

    return (
        <StateProvider>
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
