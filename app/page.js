'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useUI } from '@/context/UIContext';
import { Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './page.module.css';

export default function RootRedirect() {
    const router = useRouter();
    const { t } = useLanguage();
    const { uiConfig } = useUI();

    return (
        <div className={styles.container}>
            {/* Background Override for Main Screen */}
            {(uiConfig?.main_background_mobile_url || uiConfig?.main_background_desktop_url) && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .app-background {
                        background-image: url("${uiConfig.main_background_mobile_url || uiConfig.background_image_mobile_url}") !important;
                    }
                    @media (min-width: 768px) {
                        .app-background {
                            background-image: url("${uiConfig.main_background_desktop_url || uiConfig.background_image_desktop_url}") !important;
                        }
                    }
                `}} />
            )}

            <motion.div
                className={styles.logoContainer}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                {uiConfig?.logo_url && (
                    <img src={uiConfig.logo_url} alt="Logo" className={styles.logo} />
                )}
                <div className={styles.branding}>
                    <h1 className={styles.homeTitle}>
                        {t(uiConfig?.main_title_en, uiConfig?.main_title_ar) || t(uiConfig?.title_en, uiConfig?.title_ar) || 'Welcome'}
                    </h1>
                    <p className={styles.subtitle}>
                        {t(uiConfig?.main_subtitle_en, uiConfig?.main_subtitle_ar) || t(uiConfig?.subtitle_en, uiConfig?.subtitle_ar) || 'Please scan the table QR code'}
                    </p>
                </div>
            </motion.div>

            <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className={styles.reserveButton}
            >
                <Calendar className={styles.reserveIcon} size={28} />
                <span className={styles.reserveTitle}>
                    {t(uiConfig?.main_button_en, uiConfig?.main_button_ar) || t('Reserve Your Table', 'احجز طاولتك')}
                </span>
            </motion.button>
        </div>
    );
}
