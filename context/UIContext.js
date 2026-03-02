'use client';

import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children, initialConfig }) => {
    const [headerTitle, setHeaderTitle] = useState('');
    const [tableNumber, setTableNumber] = useState(null);
    const [tableData, setTableData] = useState(null);
    const [tableError, setTableError] = useState(false);
    const [guestId, setGuestId] = useState(null);
    const [uiConfig, setUiConfig] = useState(initialConfig);

    // Initialize/Persist Guest Session
    React.useEffect(() => {
        let savedId = localStorage.getItem('restaurant_guest_uid');
        if (!savedId) {
            savedId = crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15);
            localStorage.setItem('restaurant_guest_uid', savedId);
        }
        setGuestId(savedId);
    }, []);

    return (
        <UIContext.Provider value={{
            headerTitle, setHeaderTitle,
            tableNumber, setTableNumber,
            tableData, setTableData,
            tableError, setTableError,
            guestId,
            uiConfig, setUiConfig
        }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};
