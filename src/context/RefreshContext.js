import React, { createContext, useContext, useState, useEffect } from 'react';

const RefreshContext = createContext();

export const useRefresh = () => {
    const context = useContext(RefreshContext);
    if (!context) throw new Error('useRefresh must be used within RefreshProvider');
    return context;
};

export const RefreshProvider = ({ children }) => {
    const [enabled, setEnabled] = useState(() => 
        localStorage.getItem('refreshEnabled') === 'true'
    );
    const [interval, setInterval] = useState(() => 
        parseInt(localStorage.getItem('refreshInterval')) || 30000
    );

    useEffect(() => {
        localStorage.setItem('refreshEnabled', enabled);
    }, [enabled]);

    useEffect(() => {
        localStorage.setItem('refreshInterval', interval);
    }, [interval]);

    return (
        <RefreshContext.Provider value={{ enabled, setEnabled, interval, setInterval }}>
            {children}
        </RefreshContext.Provider>
    );
};
