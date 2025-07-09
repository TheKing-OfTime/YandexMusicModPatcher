import React, {useEffect} from 'react';
import {useOnLogEntryCreate, useOnPatchProgress} from "../Events.jsx";
import {LogMessage} from "../ui/LogMessage.jsx";

function LogCard({logEntries, setLogEntries}) {

    const addLogEntry = (logEntry) => {
        setLogEntries(prevEntries => [...prevEntries, {
            message: logEntry,
            timestamp: new Date()
        }])
    };

    const handlePatchProgressEvent = (event, args) => {
        if (args.logLabel) addLogEntry(args.logLabel);
    };

    const handleLogEntryCreateEvent = (event, args) => {
        addLogEntry(args.logLabel);
    };

    useEffect(() => {
        const offPatchProgressListener = useOnPatchProgress(handlePatchProgressEvent);
        const offLogEntryCreateEListener = useOnLogEntryCreate(handleLogEntryCreateEvent);

        return () => {
            offPatchProgressListener();
            offLogEntryCreateEListener();
        }
    }, [])

    return (
        <div className="LogCard scroll_enabled">
            <ul>{
                logEntries.map((log, index) => (
                    <li key={index}>
                        <LogMessage message={log.message} timestamp={log.timestamp}/>
                    </li>
                ))
            }</ul>
        </div>
    )
}

export default LogCard;
