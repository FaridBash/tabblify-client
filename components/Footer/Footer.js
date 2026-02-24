'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Footer.module.css';

const Footer = ({ config }) => {
    const { t } = useLanguage();
    const bottomText = config ? t(config.bottom_line_en, config.bottom_line_ar) : null;

    return (
        <footer className={styles.footer}>
            <p className={styles.bottomLine}>
                {bottomText || t('Welcome to our Restaurant', 'مرحباً بكم في مطعمنا')}
            </p>
        </footer>
    );
};

export default Footer;
