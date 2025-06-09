import React, { createContext, useState, useEffect } from 'react';

export const StateContext = createContext(null);

export const StateProvider = ({ children }) => {
    const [state, setState] = useState(null);

    useEffect(() => {
        const handleStateUpdated = (event, args) => {
            setState(args);
        };

        const remove1 = window.desktopEvents.on('STATE_UPDATED', handleStateUpdated);
        const remove2 = window.desktopEvents.on('STATE_INITIATED', handleStateUpdated);

        return () => {
            remove1();
            remove2();
        };
    }, []);

    return (
        <StateContext.Provider value={state} >
            {children}
        </StateContext.Provider>
    );
};
