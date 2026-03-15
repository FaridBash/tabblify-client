'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useUI } from '@/context/UIContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X } from 'lucide-react';
import styles from './ItemList.module.css';
import dynamic from 'next/dynamic';
const PDFMenu = dynamic(() => import('../Category/PDFMenu'), { ssr: false });
const ItemList = ({ initialItems, category }) => {
    const { language, t } = useLanguage();
    const { setHeaderTitle } = useUI();
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        setHeaderTitle(t(category?.name_en, category?.name_ar));
        return () => setHeaderTitle('');
    }, [category, t, setHeaderTitle]);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemAnim = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    if (category?.menus?.menu_type?.toLowerCase() === 'pdf') {
        return <PDFMenu pdfUrl={category.menus.pdf_url} />;
    }

    return (
        <div className={styles.wrapper}>
            <motion.div
                className={styles.grid}
                variants={container}
                initial="hidden"
                animate="show"
            >
                {initialItems.map((item) => (
                    <motion.div
                        key={item.id}
                        variants={itemAnim}
                        className={`${styles.itemCard} glass-card`}
                        onClick={() => setSelectedItem(item)}
                    >
                        <div className={styles.imageContainer}>
                            {item.image_url ? (
                                <img src={item.image_url} alt={item.name_en} className={styles.itemImage} />
                            ) : (
                                <div className={styles.placeholderImage} />
                            )}
                            <div className={styles.priceTag}>
                                {item.price} <small>{t('₪', 'شيكل')}</small>
                            </div>
                        </div>
                        <div className={styles.itemInfo}>
                            <h3 className={styles.itemName}>{t(item.name_en, item.name_ar)}</h3>
                            <p className={styles.itemDesc}>{t(item.description_en, item.description_ar)}</p>
                            <button
                                className={styles.viewButton}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedItem(item);
                                }}
                            >
                                <Eye size={18} />
                                <span>{t('View', 'عرض')}</span>
                            </button>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <AnimatePresence>
                {selectedItem && (
                    <ItemDetailModal
                        item={selectedItem}
                        onClose={() => setSelectedItem(null)}
                        t={t}
                        language={language}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const ItemDetailModal = ({ item, onClose, t, language }) => {
    return (
        <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className={`${styles.modalContent} glass-card`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <button className={styles.closeButton} onClick={onClose}>
                    <X size={24} />
                </button>

                <div className={styles.modalImageContainer}>
                    <img src={item.image_url} alt={item.name_en} className={styles.modalImage} />
                </div>

                <div className={styles.modalDetails}>
                    <h2 className="premium-gradient-text">{t(item.name_en, item.name_ar)}</h2>
                    <p className={styles.modalDescription}>{t(item.description_en, item.description_ar)}</p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)' }}>
                            {item.price} <small style={{ fontSize: '0.9rem' }}>{t('₪', 'شيكل')}</small>
                        </span>
                    </div>

                    {item.ingredients && Array.isArray(item.ingredients) && item.ingredients.length > 0 && (
                        <div className={styles.ingredientsSection}>
                            <h4>{t('Ingredients', 'المكونات')}</h4>
                            <ul className={styles.ingredientsList}>
                                {item.ingredients.map((ing, idx) => (
                                    <li key={idx}>{ing}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ItemList;
