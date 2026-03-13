'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useUI } from '@/context/UIContext';
import { Calendar, UtensilsCrossed, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './page.module.css';

export default function RootRedirect() {
    const router = useRouter();
    const { t } = useLanguage();
    const { uiConfig } = useUI();

    return (
        <div className={styles.container}>
            {/* Layout Adjustments for Home Screen */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .main-content {
                    padding-bottom: 0 !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                }
                ${(uiConfig?.main_background_mobile_url || uiConfig?.background_image_mobile_url) ? `
                .app-background {
                    background-image: url("${uiConfig?.main_background_mobile_url || uiConfig.background_image_mobile_url}") !important;
                }
                ` : ''}
                ${(uiConfig?.main_background_desktop_url || uiConfig?.background_image_desktop_url) ? `
                @media (min-width: 768px) {
                    .app-background {
                        background-image: url("${uiConfig?.main_background_desktop_url || uiConfig.background_image_desktop_url}") !important;
                    }
                }
                ` : ''}
            `}} />

            <motion.div
                className={styles.logoContainer}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                {uiConfig?.main_show_logo !== false && uiConfig?.logo_url && (
                    <img src={uiConfig.logo_url} alt="Logo" className={styles.logo} />
                )}
                <div className={styles.branding}>
                    {uiConfig?.main_show_title !== false && (
                        <h1 className={styles.homeTitle}>
                            {t(uiConfig?.main_title_en, uiConfig?.main_title_ar) || t(uiConfig?.title_en, uiConfig?.title_ar) || 'Welcome'}
                        </h1>
                    )}
                    {uiConfig?.main_show_subtitle !== false && (
                        <p className={styles.subtitle}>
                            {t(uiConfig?.main_subtitle_en, uiConfig?.main_subtitle_ar) || t(uiConfig?.subtitle_en, uiConfig?.subtitle_ar) || 'Please scan the table QR code'}
                        </p>
                    )}
                </div>
            </motion.div>

            {uiConfig?.main_show_button !== false && (
                <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className={styles.reserveButton}
                    onClick={() => window.location.href = '/reserve'}
                >
                    <Calendar className={styles.reserveIcon} size={28} />
                    <span className={styles.reserveTitle}>
                        {t(uiConfig?.main_button_en, uiConfig?.main_button_ar) || t('Reserve Your Table', 'احجز طاولتك')}
                    </span>
                </motion.button>
            )}

            {(uiConfig?.main_show_menu_button !== false) && (
                <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={styles.menuButton}
                    onClick={() => window.location.href = '/menus'}
                >
                    <UtensilsCrossed className={styles.menuIcon} size={28} />
                    <span className={styles.menuTitle}>
                        {t(uiConfig?.main_menu_button_en, uiConfig?.main_menu_button_ar) || t('View Our Menus', 'عرض قوائمنا')}
                    </span>
                </motion.button>
            )}

            <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={styles.myResButton}
                onClick={() => window.location.assign(window.location.origin + '/my-reservations')}
            >
                <ClipboardList className={styles.myResIcon} size={28} />
                <span className={styles.myResTitle}>
                    {t('My Reservations', 'حجوزاتي')}
                </span>
            </motion.button>
        </div>
    );
}
