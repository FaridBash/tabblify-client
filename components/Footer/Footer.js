'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useUI } from '@/context/UIContext';
import { MapPin } from 'lucide-react';
import { usePathname } from 'next/navigation';
import styles from './Footer.module.css';

const Footer = ({ config }) => {
    const { t } = useLanguage();
    const { tableNumber, organization, footerText } = useUI();
    const rawPathname = usePathname();

    const pathname = rawPathname;

    const isMainScreen = pathname === '/';

    if (!organization || pathname.startsWith('/reserve')) return null;

    if (isMainScreen && config?.main_show_bottom_line === false && !footerText) {
        return null;
    }

    let bottomText = footerText || null;
    if (!bottomText && config) {
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

    return (
        <footer className={styles.footer}>
            {tableNumber && (
                <div className={styles.tablePill}>
                    <MapPin size={14} className={styles.pinIcon} />
                    <span>{t('Table', 'طاولة')} {tableNumber}</span>
                </div>
            )}

            {finalBottomText && (
                <p className={styles.bottomLine}>
                    {finalBottomText}
                </p>
            )}
        </footer>
    );
};

export default Footer;
