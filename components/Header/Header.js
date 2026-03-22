'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useUI } from '@/context/UIContext';
import { Globe, X, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import styles from './Header.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';

const Header = ({ config }) => {
    const { language, setLanguage, t } = useLanguage();
    const { headerTitle, organization } = useUI();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const rawPathname = usePathname();
    const router = useRouter();

    const pathname = rawPathname;

    const isHome = pathname === '/' || /^\/t\/[^\/]+$/.test(pathname);
    const isGenericLanding = isHome && !organization;

    if (pathname.startsWith('/reserve')) return null;

    const languages = [
        { code: 'en', name: 'English', native: 'English' },
        { code: 'ar', name: 'Arabic', native: 'العربية' }
    ];

    const handleLanguageSelect = (code) => {
        setLanguage(code);
        setIsModalOpen(false);
    };

    if (isHome) {
        return (
            <div className={`${styles.headerActionsOnly} ${isGenericLanding ? '' : styles.homeHeader}`}>
                <div className={styles.actions}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsModalOpen(true)}
                        className={styles.langButton}
                    >
                        <Globe size={20} />
                        <span className={styles.currentLang}>{language.toUpperCase()}</span>
                    </motion.button>
                </div>

                <AnimatePresence>
                    {isModalOpen && (
                        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                            <motion.div
                                className={`${styles.modalContent} glass-card`}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className={styles.modalHeader}>
                                    <h3>{t('Choose Language', 'اختر اللغة')}</h3>
                                    <button onClick={() => setIsModalOpen(false)} className={styles.closeButton}>
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className={styles.langList}>
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            className={`${styles.langOption} ${language === lang.code ? styles.activeLang : ''}`}
                                            onClick={() => handleLanguageSelect(lang.code)}
                                        >
                                            <div className={styles.langInfo}>
                                                <span className={styles.langNative}>{lang.native}</span>
                                                <span className={styles.langEnglish}>{lang.name}</span>
                                            </div>
                                            {language === lang.code && <Check size={18} className={styles.checkIcon} />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <>
            <header className={`${styles.header} ${isHome ? styles.homeHeader : styles.subHeader}`}>
                <AnimatePresence mode="popLayout">
                    {isHome ? (
                        config && (
                            <motion.div
                                key="home-header"
                                className={styles.logoContainer}
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -10, opacity: 0 }}
                                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            >
                                {config?.logo_url && (
                                    <img src={config.logo_url} alt="Logo" className={styles.logo} />
                                )}
                                <div className={styles.branding}>
                                    <h1 className={styles.homeTitle}>
                                        {t(config?.title_en, config?.title_ar)}
                                    </h1>
                                    <p className={styles.subtitle}>
                                        {t(config?.subtitle_en, config?.subtitle_ar)}
                                    </p>
                                </div>
                            </motion.div>
                        )
                    ) : (
                        <motion.div
                            key="sub-header"
                            className={styles.subHeaderContent}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 10, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        >
                            <button
                                onClick={() => router.back()}
                                className={styles.backButton}
                            >
                                {language === 'ar' ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
                            </button>
                            <h1 className={styles.pageTitle}>{headerTitle}</h1>

                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Always show actions, positioned at the top right of the header */}
                <div className={styles.actions}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsModalOpen(true)}
                        className={styles.langButton}
                    >
                        <Globe size={20} />
                        <span className={styles.currentLang}>{language.toUpperCase()}</span>
                    </motion.button>
                </div>
            </header>

            <AnimatePresence>
                {isModalOpen && (
                    <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                        <motion.div
                            className={`${styles.modalContent} glass-card`}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.modalHeader}>
                                <h3>{t('Choose Language', 'اختر اللغة')}</h3>
                                <button onClick={() => setIsModalOpen(false)} className={styles.closeButton}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className={styles.langList}>
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        className={`${styles.langOption} ${language === lang.code ? styles.activeLang : ''}`}
                                        onClick={() => handleLanguageSelect(lang.code)}
                                    >
                                        <div className={styles.langInfo}>
                                            <span className={styles.langNative}>{lang.native}</span>
                                            <span className={styles.langEnglish}>{lang.name}</span>
                                        </div>
                                        {language === lang.code && <Check size={18} className={styles.checkIcon} />}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Header;
