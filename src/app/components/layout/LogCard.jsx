import React, { useEffect, useState, useRef } from 'react';
import { LogMessage } from "../ui/LogMessage.jsx";
import CopyButton from '../ui/CopyButton.jsx';
import Dropdown from '../ui/Dropdown.jsx';

import '../../styles/LogCard.css';


const OPTIONS = [
    { id: 'vrb', label: 'Фильтр: Все' },
    { id: 'log', label: 'Фильтр: Логи' },
    { id: 'err', label: 'Фильтр: Ошибки' },
]

const FILTER_MAP = {
    vrb: logLevel => true,
    log: logLevel => logLevel !== 'vrb',
    wrn: logLevel => logLevel !== 'vrb' && logLevel !== 'log',
    err: logLevel => logLevel === 'err',
}

function LogCard({ logEntries, setFilterLevel, filterLevel }) {

    const listRef = useRef(null);
    const [ isAtBottom, setIsAtBottom ] = useState(true);


    useEffect(() => {
        if (isAtBottom && listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight - listRef.current.clientHeight;
        }
    }, [logEntries, isAtBottom]);

    return (
    <div className="LogCard">
        <div className="LogCard_header">
            <CopyButton icon="file_copy" variant="secondary" tooltipBefore="Скопировать все логи" tooltipAfter="Логи скопированы!" tooltipDirection="bottom" onClick={
                () => {
                    return logEntries.map(log => {
                        const d = new Date(log.timestamp);
                        const formatDate = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
                        return `${formatDate} [${(log.logEntry.logLevel ?? 'log').toUpperCase()}] ${log.logEntry.logLabel}`;
                    }).join('\n');
                }
            }/>
            <div style={{ width: '200px' }}>
                <Dropdown onSelect={(option)=>setFilterLevel(option.id)} placeholder="Фильтр" defaultOption={OPTIONS.find(x=>x.id===filterLevel)} options={OPTIONS}/>
            </div>
        </div>
        <ul className="LogCard_LogList scroll_enabled"  ref={listRef} onScroll={
            () => {
                const el = listRef.current;
                setIsAtBottom(el.scrollHeight - el.scrollTop === el.clientHeight);
            }
        }>
            {logEntries.map((log, index) => {
                if(FILTER_MAP[filterLevel](log.logEntry.logLevel)) return (
                    <li key={ index }>
                        <LogMessage logLevel={ log.logEntry.logLevel ?? ((log.logEntry.progress === -1) ? 'err' : undefined) } message={ log.logEntry.logLabel } timestamp={ log.timestamp }/>
                    </li>
                )
            })}
        </ul>
    </div>
    )
}

export default LogCard;
