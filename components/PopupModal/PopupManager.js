'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import PopupModal from './PopupModal';

export default function PopupManager() {
    const pathname = usePathname();
    const { uiConfig } = useUI();

    if (!uiConfig) return null;

    const isHome = pathname === '/';
    // Matches /t/[any-table-id] but NOT /t/[any-table-id]/menu/...
    // Actually, usually users call the /t/[t] screen as "menu screen"
    const isMenu = pathname.startsWith('/t/') && !pathname.includes('/menu/');

    return (
        <>
            {isHome && (
                <PopupModal
                    config={uiConfig}
                    type="main"
                />
            )}
            {isMenu && (
                <PopupModal
                    config={uiConfig}
                    type="menu"
                />
            )}
        </>
    );
}
