import './globals.css';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { getOrganization } from '@/lib/org';
import { Providers } from '@/components/Providers';
import { LanguageProvider } from '@/context/LanguageContext';
import NotFoundUI from './not-found';

export const metadata = {
  title: 'Tabblify',
  description: 'Premium Digital Menu & Interactive Experience',
};

async function getUIConfig(organizationId) {
  if (!organizationId) return null;

  try {
    const { data, error } = await supabase
      .from('ui_config')
      .select(`
        *,
        themes (*)
      `)
      .eq('organization_id', organizationId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('Error fetching UI config:', error);
      }
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error fetching UI config:', error);
    return null;
  }
}

export default async function RootLayout({ children }) {
  const organization = await getOrganization();
  
  if (organization?.error === 'ORG_NOT_FOUND') {
    return (
      <html lang="en" dir="ltr" suppressHydrationWarning>
        <body suppressHydrationWarning>
          <LanguageProvider>
            <NotFoundUI />
          </LanguageProvider>
        </body>
      </html>
    );
  }

  const uiConfig = await getUIConfig(organization?.id);
  const theme = uiConfig?.themes;

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers uiConfig={uiConfig} organization={organization} theme={theme}>
            <div className="app-container">
                {/* SSR Theme Overrides */}
                {theme && (
                  <style dangerouslySetInnerHTML={{
                    __html: `
                    :root {
                      ${theme.primary_color ? `--primary: ${theme.primary_color};` : ''}
                      ${theme.primary_rgb ? `--primary-rgb: ${theme.primary_rgb};` : ''}
                      ${theme.primary_glow ? `--primary-glow: ${theme.primary_glow};` : ''}
                      ${theme.primary_dim ? `--primary-dim: ${theme.primary_dim};` : ''}
                      ${theme.secondary_color ? `--secondary: ${theme.secondary_color};` : ''}
                      ${theme.secondary_color ? `--secondary-light: ${theme.secondary_color};` : ''}
                      ${theme.secondary_rgb ? `--secondary-rgb: ${theme.secondary_rgb};` : ''}
                      ${theme.secondary_dark ? `--secondary-dark: ${theme.secondary_dark};` : ''}
                      ${theme.background_color ? `--background: ${theme.background_color};` : ''}
                      ${theme.foreground_color ? `--foreground: ${theme.foreground_color};` : ''}
                      ${theme.success_color ? `--success: ${theme.success_color};` : ''}
                      ${theme.warning_color ? `--warning: ${theme.warning_color};` : ''}
                      ${theme.error_color ? `--error: ${theme.error_color};` : ''}
                      ${theme.primary_rgb ? `--glass-bg: rgba(${theme.primary_rgb}, 0.05);` : ''}
                      ${theme.primary_rgb ? `--glass-border: rgba(${theme.primary_rgb}, 0.15);` : ''}
                    }
                  `}} />
                )}
                <style dangerouslySetInnerHTML={{
                  __html: `
                    html, body {
                      height: 100dvh !important;
                      width: 100% !important;
                      overflow: hidden !important;
                      overflow-x: hidden !important;
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
                      grid-template-rows: auto 1fr auto !important;
                      height: 100dvh !important;
                      width: 100% !important;
                      position: relative !important;
                      z-index: 10;
                      overflow: hidden !important;
                      overflow-x: hidden !important;
                    }
                    .main-content {
                      min-height: 0 !important;
                       overflow-y: auto;
                      -webkit-overflow-scrolling: touch;
                      scrollbar-width: none;
                      position: relative;
                    }
                    .main-content::-webkit-scrollbar {
                      display: none;
                    }
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
                    ${uiConfig.background_image_mobile_url ? `
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
                    ` : ''}
                    ${uiConfig.background_image_desktop_url ? `
                    @media (min-width: 768px) {
                      .app-background {
                        background-image: url("${uiConfig.background_image_desktop_url}");
                      }
                    }
                    ` : ''}
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
            
            {/* Debug Footer */}
            {organization && (
              <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(0,0,0,0.8)',
                color: '#00ff00',
                fontSize: '10px',
                padding: '2px 8px',
                textAlign: 'center',
                zIndex: 99999,
                pointerEvents: 'none',
                fontFamily: 'monospace'
              }}>
                Tenant: {organization.name} | Slug: {organization.slug} | ID: {organization.id.slice(0, 8)}
              </div>
            )}
            {!organization && (
              <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(255,0,0,0.8)',
                color: 'white',
                fontSize: '10px',
                padding: '2px 8px',
                textAlign: 'center',
                zIndex: 99999,
                pointerEvents: 'none',
                fontFamily: 'monospace'
              }}>
                Tabblify Landing Mode
              </div>
            )}
        </Providers>
      </body>
    </html>
  );
}
