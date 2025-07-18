import React from "react";


export function LogMessage({ message, timestamp }) {
    const formatDate = (date) => {
        const pad = (num, len = 2) => String(num).padStart(len, '0');
        const d = new Date(date);
        return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };
    return (
    <div className="LogEntry">[{formatDate(timestamp)}] {message}</div>
    );
}
