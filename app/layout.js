import { LanguageProvider } from '@/context/LanguageContext';
import { CartProvider } from '@/context/CartContext';
import { UIProvider } from '@/context/UIContext';
import './globals.css';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import TableInitializer from '@/components/TableInitializer';
import TableErrorModal from '@/components/TableErrorModal';
import ServiceBell from '@/components/ServiceBell/ServiceBell';

export const metadata = {
  title: 'Restaurant Client',
  description: 'Premium Digital Menu',
};

async function getUIConfig() {
  try {
    const { data, error } = await supabase
      .from('ui_config')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching UI config:', error);
    return null;
  }
}

export default async function RootLayout({ children }) {
  const uiConfig = await getUIConfig();

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LanguageProvider>
          <UIProvider>
            <TableInitializer />
            <TableErrorModal />
            <ServiceBell />
            <CartProvider>
              <div className="app-container">
                {/* Core structural styles that must always load */}
                <style dangerouslySetInnerHTML={{
                  __html: `
                    html, body {
                      height: 100dvh !important;
                      width: 100vw !important;
                      overflow: hidden !important;
                      position: fixed !important;
                      top: 0 !important;
                      left: 0 !important;
                      right: 0 !important;
                      bottom: 0 !important;
                      margin: 0 !important;
                      padding: 0 !important;
                      background: #000 !important;
                    }
                    .app-container {
                      display: grid !important;
                      grid-template-rows: auto 1fr 70px !important; /* Fixed footer height for reliability */
                      height: 100dvh !important;
                      width: 100vw !important;
                      position: relative !important;
                      z-index: 10;
                      overflow: hidden !important;
                    }
                    .main-content {
                      min-height: 0 !important;
                      overflow-y: auto !important;
                      -webkit-overflow-scrolling: touch;
                      scrollbar-width: none;
                      position: relative;
                    }
                    .main-content::-webkit-scrollbar {
                      display: none;
                    }
                    /* Clean up mobile UI */
                    #__next-build-watcher, 
                    #webpack-dev-server-client-overlay,
                    .nextjs-static-indicator {
                      display: none !important;
                    }
                  ` }} />

                {/* Conditional branding styles */}
                {uiConfig && (
                  <style dangerouslySetInnerHTML={{
                    __html: `
                    .app-background {
                      position: fixed;
                      inset: 0;
                      background-image: url("${uiConfig.background_image_mobile_url}");
                      background-size: cover;
                      background-position: center;
                      background-repeat: no-repeat;
                      z-index: -1;
                      transform: translateZ(0);
                    }
                    @media (min-width: 768px) {
                      .app-background {
                        background-image: url("${uiConfig.background_image_desktop_url}");
                      }
                    }
                    .app-background::after {
                      content: '';
                      position: absolute;
                      top: 0;
                      left: 0;
                      width: 100%;
                      height: 100%;
                      background: rgba(0, 0, 0, 0.4);
                    }
                  ` }} />
                )}

                <div className="app-background" />
                <Header config={uiConfig} />
                <main className="main-content">
                  {children}
                </main>
                <Footer config={uiConfig} />
              </div>
            </CartProvider>
          </UIProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
