import React, { createContext, useCallback, useState } from 'react';

export const UpdaterStateContext = createContext(null);

const DEFAULT_STATUS = 'Проверка обновлений...';

const initialState = {
    ym: {
        status: DEFAULT_STATUS,
        version: '',
        newVersion: '',
        progress: 1.1, // intermediate
    },
    self: {
        status: DEFAULT_STATUS,
        version: '',
        newVersion: '',
        progress: 1.1, // intermediate
    },
    mod: {
        status: DEFAULT_STATUS,
        version: '',
        newVersion: '',
        progress: 1.1, // intermediate
    },
};

export const UpdaterStateProvider = ({ children }) => {
    const [state, setState] = useState(initialState);

    const updateYMState = useCallback((updates) => {
        setState(prev => ({
            ...prev,
            ym: { ...prev.ym, ...updates }
        }));
    }, []);

    const updateSelfState = useCallback((updates) => {
        setState(prev => ({
            ...prev,
            self: { ...prev.self, ...updates }
        }));
    }, []);

    const updateModState = useCallback((updates) => {
        setState(prev => ({
            ...prev,
            mod: { ...prev.mod, ...updates }
        }));
    }, []);

    const value = {
        state,
        updateYMState,
        updateSelfState,
        updateModState,
    };

    return (
        <UpdaterStateContext.Provider value={value}>
            {children}
        </UpdaterStateContext.Provider>
    );
};
