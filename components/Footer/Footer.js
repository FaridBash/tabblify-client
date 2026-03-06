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

    if (pathname.startsWith('/reserve')) return null;

    if (isMainScreen && config?.main_show_bottom_line === false) {
        return null;
    }

    let bottomText = null;
    if (config) {
        if (isMainScreen) {
            if (config.main_bottom_line_en || config.main_bottom_line_ar) {
                bottomText = t(config.main_bottom_line_en, config.main_bottom_line_ar);
            } else {
                bottomText = t(config.bottom_line_en, config.bottom_line_ar);
            }
        } else {
            bottomText = t(config.bottom_line_en, config.bottom_line_ar);
        }
    }

    const finalBottomText = bottomText !== null && bottomText !== ''
        ? bottomText
        : (bottomText === '' ? '' : t('Welcome to our Restaurant', 'مرحباً بكم في مطعمنا'));

    const { tableNumber } = useUI();

    return (
        <footer className={styles.footer}>
            <div className={styles.tablePill} style={{ visibility: tableNumber ? 'visible' : 'hidden' }}>
                <MapPin size={14} className={styles.pinIcon} />
                <span>Table {tableNumber || '??'}</span>
            </div>

            {finalBottomText && (
                <p className={styles.bottomLine}>
                    {finalBottomText}
                </p>
            )}

            {/* <div className={styles.brandPlaceholder}>
                <span className={styles.brandN}>N</span>
            </div> */}
        </footer>
    );
};

export default Footer;
