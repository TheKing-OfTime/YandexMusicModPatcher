import React, { useEffect, useState, useCallback } from 'react';

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

function LogCard({ logEntries, setLogEntries }) {

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
        const offPatchProgressListener = window.desktopEvents.on('PATCH_PROGRESS', handlePatchProgressEvent)
        const offLogEntryCreateEListener = window.desktopEvents.on('LOG_ENTRY_CREATE', handleLogEntryCreateEvent)

        return () => {
            offPatchProgressListener();
            offLogEntryCreateEListener();
        }
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
