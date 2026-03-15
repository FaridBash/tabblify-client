'use client';

import { LanguageProvider } from '@/context/LanguageContext';
import { UIProvider } from '@/context/UIContext';
import { CartProvider } from '@/context/CartContext';
import ThemeInjector from '@/components/ThemeInjector';
import PopupManager from '@/components/PopupModal';
import TableInitializer from '@/components/TableInitializer';
import TableErrorModal from '@/components/TableErrorModal';
import ServiceBell from '@/components/ServiceBell/ServiceBell';

export function Providers({ children, uiConfig, organization, theme }) {
  return (
    <LanguageProvider>
      <UIProvider initialConfig={uiConfig} organization={organization}>
        <ThemeInjector initialTheme={theme} />
        <PopupManager />
        <TableInitializer />
        <TableErrorModal />
        <ServiceBell />
        <CartProvider>
          {children}
        </CartProvider>
      </UIProvider>
    </LanguageProvider>
  );
}
