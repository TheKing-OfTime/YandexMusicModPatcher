import React, { useEffect, useState, useRef } from 'react';
import { useOnLogEntryCreate, useOnPatchProgress } from "../Events.jsx";
import { LogMessage } from "../ui/LogMessage.jsx";


function LogCard({ logEntries, setLogEntries }) {

    const listRef = useRef(null);
    const [ isAtBottom, setIsAtBottom ] = useState(true);


    useEffect(() => {
        if (isAtBottom && listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight - listRef.current.clientHeight;
        }
    }, [logEntries, isAtBottom]);

    return (
    <div className="LogCard scroll_enabled" ref={listRef}
         onScroll={() => {
             const el = listRef.current;
             setIsAtBottom(el.scrollHeight - el.scrollTop === el.clientHeight);
         }}
    >
        <ul>
            {logEntries.map((log, index) => (
            <li key={index}>
                <LogMessage message={log.message} timestamp={log.timestamp}/>
            </li>
            ))}
        </ul>
    </div>
    )
}

export default LogCard;
