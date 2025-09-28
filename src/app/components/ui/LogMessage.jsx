import React from "react";

const LOG_LEVEL_MAP = {
    'log': 'LogEntry_log',
    'wrn': 'LogEntry_warning',
    'err': 'LogEntry_error',
    'vrb': 'LogEntry_verbose',
}

export function LogMessage({ logLevel='log', message, timestamp }) {
    const formatDate = (date) => {
        const pad = (num, len = 2) => String(num).padStart(len, '0');
        const d = new Date(date);
        return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };
    return (
        <div className={ `LogEntry ${LOG_LEVEL_MAP[logLevel]}` }>{formatDate(timestamp)} [{logLevel.toUpperCase()}] {message}</div>
    );
}
