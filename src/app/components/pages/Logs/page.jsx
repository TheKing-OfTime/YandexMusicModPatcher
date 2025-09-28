import React from 'react';
import LogCard from '../../layout/LogCard.jsx';

function LogsPage ({ logEntries, filterLevel, setFilterLevel }) {
    return (
        <LogCard logEntries={logEntries} filterLevel={filterLevel} setFilterLevel={setFilterLevel}/>
    )
}

export default LogsPage;
