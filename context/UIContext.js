'use client';

import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
    const [headerTitle, setHeaderTitle] = useState('');
    const [tableNumber, setTableNumber] = useState(null);
    const [tableData, setTableData] = useState(null);
    const [tableError, setTableError] = useState(false);

    return (
        <UIContext.Provider value={{
            headerTitle, setHeaderTitle,
            tableNumber, setTableNumber,
            tableData, setTableData,
            tableError, setTableError
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
