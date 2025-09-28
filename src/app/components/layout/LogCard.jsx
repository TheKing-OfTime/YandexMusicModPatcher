import React, { useEffect, useState, useRef } from 'react';
import { LogMessage } from "../ui/LogMessage.jsx";
import InlineButton from '../ui/InlineButton.jsx';
import Dropdown from '../ui/Dropdown.jsx';
import Tooltip from '../ui/Tooltip.jsx';

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
    const [ didCopy, setDidCopy ] = useState(false);


    useEffect(() => {
        if (isAtBottom && listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight - listRef.current.clientHeight;
        }
    }, [logEntries, isAtBottom]);

    return (
    <div className="LogCard">
        <div className="LogCard_header">
            <Tooltip label={ didCopy ? "Логи скопированы!" : "Скопировать все логи" } direction="bottom" onMouseEnter={ () => setDidCopy(false) }>
                <InlineButton onClick={
                    () => {
                        const text = logEntries.map(log => {
                            setDidCopy(true);
                            const d = new Date(log.timestamp);
                            const formatDate = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
                            return `${formatDate} [${(log.logEntry.logLevel ?? 'log').toUpperCase()}] ${log.logEntry.logLabel}`;
                        }).join('\n');
                        navigator.clipboard.writeText(text);
                    }
                } icon="file_copy" variant="secondary"/>
            </Tooltip>
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
                        <LogMessage logLevel={ log.logEntry.logLevel } message={ log.logEntry.logLabel } timestamp={ log.timestamp }/>
                    </li>
                )
            })}
        </ul>
    </div>
    )
}

export default LogCard;
