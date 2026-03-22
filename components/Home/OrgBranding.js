'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import styles from './OrgBranding.module.css';

const OrgBranding = ({ uiConfig, title, subtitle, mode = 'menu' }) => {
    const { language, t } = useLanguage();

    if (!uiConfig) return null;

    const isHomeMode = mode === 'home';

    const displayTitle = title
        ? (typeof title === 'string' ? title : t(title.en, title.ar))
        : (isHomeMode
            ? (t(uiConfig.main_title_en, uiConfig.main_title_ar) || t(uiConfig.title_en, uiConfig.title_ar) || 'Welcome')
            : (t(uiConfig.title_en, uiConfig.title_ar) || t('View Our Menus', 'عرض قوائمنا')));

    const displaySubtitle = subtitle
        ? (typeof subtitle === 'string' ? subtitle : t(subtitle.en, subtitle.ar))
        : (isHomeMode
            ? (t(uiConfig.main_subtitle_en, uiConfig.main_subtitle_ar) || t(uiConfig.subtitle_en, uiConfig.subtitle_ar) || '')
            : (t(uiConfig.subtitle_en, uiConfig.subtitle_ar) || ''));

    return (
        <motion.div
            className={styles.logoContainer}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
            {uiConfig.main_show_logo !== false && uiConfig.logo_url && (
                <img src={uiConfig.logo_url} alt="Logo" className={styles.logo} />
            )}
            <div className={styles.branding}>
                {(uiConfig.main_show_title !== false || !!title) && displayTitle && (
                    <h1 className={styles.homeTitle}>
                        {displayTitle}
                    </h1>
                )}
                {(uiConfig.main_show_subtitle !== false || !!subtitle) && displaySubtitle && (
                    <p className={styles.subtitle}>
                        {displaySubtitle}
                    </p>
                )}
            </div>
        </motion.div>
    );
};

export default OrgBranding;
