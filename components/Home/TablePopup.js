'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import styles from './TablePopup.module.css';

export default function TablePopup({ reservation }) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!reservation || !reservation.popup_enabled) return;

        // Check show limit
        const limitStr = reservation.popup_show_limit;
        const limit = limitStr ? parseInt(limitStr, 10) : 1; // Default to 1 if not set
        const storageKey = `seen_res_popup_${reservation.id}`;
        const seenCount = parseInt(sessionStorage.getItem(storageKey) || '0', 10);

        // If limit is 0, it means unlimited? User probably meant limit > 0.
        // Let's assume limit > seenCount
        if (limit === 0 || seenCount < limit) {
            setIsOpen(true);
            sessionStorage.setItem(storageKey, (seenCount + 1).toString());
        }
    }, [reservation]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className={styles.overlay} onClick={() => setIsOpen(false)}>
                    <motion.div
                        className={styles.modal}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                        
                        {reservation.popup_image_url && (
                            <img 
                                src={reservation.popup_image_url} 
                                alt={reservation.popup_title || 'Popup Image'} 
                                className={styles.image} 
                            />
                        )}

                        <div className={styles.content}>
                            {reservation.popup_title && (
                                <h2 className={styles.title}>{reservation.popup_title}</h2>
                            )}
                            {reservation.popup_description && (
                                <p className={styles.description}>{reservation.popup_description}</p>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
