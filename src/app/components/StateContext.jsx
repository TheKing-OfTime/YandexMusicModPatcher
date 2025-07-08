import React, { createContext, useState, useEffect } from 'react';
import { useOnStateUpdated, useOnStateInitiated } from "./Events.jsx";

export const StateContext = createContext(null);

export const StateProvider = ({ children }) => {
    const [state, setState] = useState(null);

    useEffect(() => {
        const handleStateUpdated = (event, args) => {
            setState(args);
        };

        const OffStateUpdated = useOnStateUpdated(handleStateUpdated);
        const OffStateInitiated = useOnStateInitiated(handleStateUpdated);

        return () => {
            OffStateUpdated();
            OffStateInitiated();
        };
    }, []);

    return (
        <StateContext.Provider value={state} >
            {children}
        </StateContext.Provider>
    );
};
