import * as React from 'react';
import {createRoot} from 'react-dom/client';
import TitleBar from './TitleBar.jsx'
import MainProgressBar from './MainProgressBar.jsx'
import ActionsBar from "./ActionsBar.jsx";
import LogCard from './LogCard.jsx';
import CustomPathModal from "./CustomPathModal.jsx";

function App() {

    return (
        <>
            <TitleBar/>
            <main className="App">
                <MainProgressBar/>
                <LogCard/>
                <ActionsBar/>
            </main>
            <CustomPathModal/>
        </>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(
    <>
        <App/>
    </>
);
