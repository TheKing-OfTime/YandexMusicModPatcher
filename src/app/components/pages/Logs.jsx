import React from 'react';
import LogCard from '../layout/LogCard.jsx';

function LogsPage ({ logEntries, setLogEntries }) {
    return (
        <LogCard logEntries={logEntries} setLogEntries={setLogEntries}/>
    )
}

export default LogsPage;
