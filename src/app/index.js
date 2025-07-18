import './styles/index.css';
import './components/App.jsx';

import log from 'electron-log/renderer';

const renderLogger = log.scope('renderer')

console.log = renderLogger.log
console.debug = renderLogger.debug
console.warn = renderLogger.warn
console.error = renderLogger.error
