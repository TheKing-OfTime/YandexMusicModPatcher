import * as React from 'react';
import {useEffect, useState} from "react";

function LogMessage({ message, timestamp }) {
    const formatDate = (date) => {
        const pad = (num, len=2) => String(num).padStart(len, '0');
        const d = new Date(date);
        return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}:${pad(d.getMilliseconds(), 3)}`;
    };
    return (
        <div className="LogEntry">[{formatDate(timestamp)}] {message}</div>
    );
}

function LogCard() {
    const [logEntries, setLogEntries] = useState([]);
    const addLogEntry = (logEntry) => {
        setLogEntries(prevEntries => [...prevEntries, {
            message: logEntry,
            timestamp: new Date()
        }]);
    }

    useEffect(() => {
        window.desktopEvents.on('PATCH_PROGRESS', (event, args) => {
            if (args.logLabel) addLogEntry(args.logLabel);
        })
        window.desktopEvents.on('LOG_ENTRY_CREATE', (event, args) => {
            addLogEntry(args.logLabel);
        })
        addLogEntry('Patcher ready');
    }, [])

    return (
        <div className="LogCard scroll_enabled"><ul>{
            logEntries.map((log, index) => (
                <li key={index}>
                    <LogMessage message={log.message} timestamp={log.timestamp} />
                </li>
            ))
        }</ul></div>
    )
}

export default LogCard;
