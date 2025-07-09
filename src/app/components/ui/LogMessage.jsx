import React from "react";

export function LogMessage({message, timestamp}) {
    const formatDate = (date) => {
        const pad = (num, len = 2) => String(num).padStart(len, '0');
        const d = new Date(date);
        return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}:${pad(d.getMilliseconds(), 3)}`;
    };
    return (
        <div className="LogEntry">[{formatDate(timestamp)}] {message}</div>
    );
}
