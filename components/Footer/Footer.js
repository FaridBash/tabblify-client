'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useUI } from '@/context/UIContext';
import { MapPin } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = ({ config }) => {
    const { t } = useLanguage();
    const bottomText = config ? t(config.bottom_line_en, config.bottom_line_ar) : null;

    const { tableNumber } = useUI();

    return (
        <footer className={styles.footer}>
            {tableNumber && (
                <div className={styles.tablePill}>
                    <MapPin size={14} className={styles.pinIcon} />
                    <span>Table {tableNumber}</span>
                </div>
            )}
            <p className={styles.bottomLine}>
                {bottomText || t('Welcome to our Restaurant', 'مرحباً بكم في مطعمنا')}
            </p>
        </footer>
    );
};

export default Footer;
