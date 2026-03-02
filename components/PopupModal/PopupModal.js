'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './PopupModal.module.css';

export default function PopupModal({ config, type = 'main' }) {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        if (!config) return;

        const isEnabled = type === 'main' ? config.main_popup_enabled : config.menu_popup_enabled;
        const limit = type === 'main' ? config.main_popup_show_limit : config.menu_popup_show_limit;

        if (!isEnabled) return;

        // Create a unique fingerprint for the current popup content to detect changes
        const contentFingerprint = type === 'main'
            ? `${config.main_popup_type}-${config.main_popup_title_en}-${config.main_popup_image_url}`
            : `${config.menu_popup_type}-${config.menu_popup_title_en}-${config.menu_popup_image_url}`;

        const storageKey = `popup_count_${type}_${config.id || 'current'}`;
        const fingerprintKey = `popup_fingerprint_${type}_${config.id || 'current'}`;

        const lastFingerprint = localStorage.getItem(fingerprintKey);
        let seenCount = parseInt(localStorage.getItem(storageKey) || '0', 10);

        // If the content has changed, reset the seen counter
        if (lastFingerprint !== contentFingerprint) {
            seenCount = 0;
            localStorage.setItem(fingerprintKey, contentFingerprint);
        }

        if (limit === null || seenCount < limit) {
            // Show only after a slight delay for better UX
            const timer = setTimeout(() => {
                setIsOpen(true);
                localStorage.setItem(storageKey, (seenCount + 1).toString());
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [config, type]);

    if (!isOpen || !config) return null;

    const popupData = {
        type: type === 'main' ? config.main_popup_type : config.menu_popup_type,
        title: type === 'main'
            ? t(config.main_popup_title_en, config.main_popup_title_ar)
            : t(config.menu_popup_title_en, config.menu_popup_title_ar),
        description: type === 'main'
            ? t(config.main_popup_description_en, config.main_popup_description_ar)
            : t(config.menu_popup_description_en, config.menu_popup_description_ar),
        image: type === 'main' ? config.main_popup_image_url : config.menu_popup_image_url
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className={styles.overlay} onClick={() => setIsOpen(false)}>
                    <motion.div
                        className={styles.modal}
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
                            <X size={24} />
                        </button>

                        {popupData.type === 'image' && popupData.image ? (
                            <img
                                src={popupData.image}
                                alt="Announcement"
                                className={styles.imageContent}
                            />
                        ) : (
                            <div className={styles.textContent}>
                                {popupData.title && (
                                    <h2 className={styles.title}>{popupData.title}</h2>
                                )}
                                {popupData.description && (
                                    <p className={styles.description}>{popupData.description}</p>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
