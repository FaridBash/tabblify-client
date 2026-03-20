'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import PopupModal from './PopupModal';

export default function PopupManager() {
    const rawPathname = usePathname();
    const { uiConfig, organization } = useUI();

    const pathname = rawPathname;

    if (!uiConfig) return null;

    const isHome = pathname === '/';
    const isMenusPage = pathname === '/menus';
    const isTableMenu = pathname.startsWith('/t/') && !pathname.includes('/menu/');

    return (
        <>
            {(isHome || isMenusPage) && (
                <PopupModal
                    config={uiConfig}
                    type="main"
                />
            )}
            {(isMenusPage || isTableMenu) && (
                <PopupModal
                    config={uiConfig}
                    type="menu"
                />
            )}
        </>
    );
}
