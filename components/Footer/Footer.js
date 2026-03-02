'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useUI } from '@/context/UIContext';
import { MapPin } from 'lucide-react';
import { usePathname } from 'next/navigation';
import styles from './Footer.module.css';

const Footer = ({ config }) => {
    const { t } = useLanguage();
    const pathname = usePathname();
    const isMainScreen = pathname === '/';

    const bottomText = config ? (
        isMainScreen && (config.main_bottom_line_en || config.main_bottom_line_ar)
            ? t(config.main_bottom_line_en, config.main_bottom_line_ar)
            : t(config.bottom_line_en, config.bottom_line_ar)
    ) : null;

    const { tableNumber } = useUI();

    return (
        <footer className={styles.footer}>
            <div className={styles.tablePill} style={{ visibility: tableNumber ? 'visible' : 'hidden' }}>
                <MapPin size={14} className={styles.pinIcon} />
                <span>Table {tableNumber || '??'}</span>
            </div>

            <p className={styles.bottomLine}>
                {bottomText || t('Welcome to our Restaurant', 'مرحباً بكم في مطعمنا')}
            </p>

            <div className={styles.brandPlaceholder}>
                <span className={styles.brandN}>N</span>
            </div>
        </footer>
    );
};

export default Footer;
