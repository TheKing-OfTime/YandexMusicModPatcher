import * as React from 'react';
import {createRoot} from 'react-dom/client';
import TitleBar from './TitleBar.jsx'
import MainProgressBar from './MainProgressBar.jsx'
import ActionsBar from "./ActionsBar.jsx";

const root = createRoot(document.getElementById('root'));
root.render(
    <>
        <TitleBar/>
        <main className="App">
                <MainProgressBar/>
                <div className="Main">

                </div>
                <ActionsBar/>
        </main>
    </>
);
