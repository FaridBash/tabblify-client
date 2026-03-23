'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useUI } from '@/context/UIContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, X, MapPin } from 'lucide-react';
import styles from './ItemList.module.css';
import dynamic from 'next/dynamic';
const PDFMenu = dynamic(() => import('../Category/PDFMenu'), { ssr: false });

const ItemList = ({ initialItems, category }) => {
    const { language, t } = useLanguage();
    const { setHeaderTitle } = useUI();
    const [selectedItem, setSelectedItem] = useState(null);
    const [isSticky, setIsSticky] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const sentinelRef = React.useRef(null);

    useEffect(() => {
        setHeaderTitle(t(category?.name_en, category?.name_ar));
        return () => setHeaderTitle('');
    }, [category, t, setHeaderTitle]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsSticky(!entry.isIntersecting);
            },
            { 
                threshold: [0],
                // Root is the scrollable main content from layout.js
                rootMargin: '-5px 0px 0px 0px' 
            }
        );

        const currentSentinel = sentinelRef.current;
        if (currentSentinel) {
            observer.observe(currentSentinel);
        }

        return () => {
            if (currentSentinel) {
                observer.unobserve(currentSentinel);
            }
        };
    }, []);

    const filteredItems = (initialItems || []).filter(item => {
        const query = searchTerm.toLowerCase().trim();
        if (!query) return true;
        
        const nameEn = (item.name_en || '').toLowerCase();
        const nameAr = (item.name_ar || '').toLowerCase();
        return nameEn.includes(query) || nameAr.includes(query);
    });

    const container = {
        hidden: { opacity: 1 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemAnim = {
        hidden: { y: 0, opacity: 1 },
        show: { y: 0, opacity: 1 }
    };

    if (category?.menus?.menu_type?.toLowerCase() === 'pdf') {
        return <PDFMenu pdfUrl={category.menus.pdf_url} />;
    }

    return (
        <div className={styles.wrapper}>
            <style dangerouslySetInnerHTML={{
                __html: `
                    html, body, .app-container, .main-content {
                        background: transparent !important;
                    }
                    .app-background {
                        background-image: none !important;
                        background: 
                            radial-gradient(circle at 0% 0%, rgba(var(--primary-glow-rgb), 0.25) 0%, transparent 45%),
                            radial-gradient(circle at 100% 40%, rgba(var(--primary-rgb), 0.2) 0%, transparent 40%),
                            radial-gradient(circle at 50% 110%, var(--secondary) 0%, transparent 60%),
                            var(--secondary-dark) !important;
                        display: block !important;
                        z-index: -1 !important;
                        opacity: 1 !important;
                        background-attachment: fixed !important;
                    }
                `
            }} />
            <div ref={sentinelRef} style={{ height: '1px', marginBottom: '-1px', pointerEvents: 'none' }} />
            <div className={`${styles.searchContainer} ${isSticky ? styles.stuck : ''}`}>
                <div className={styles.searchBox}>
                    <input 
                        type="text" 
                        placeholder={t('Search', 'بحث')} 
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className={styles.searchIcon} size={20} />
                </div>
            </div>

            <motion.div
                className={styles.grid}
                variants={container}
                initial="hidden"
                animate="show"
            >
                {filteredItems.map((item) => (
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
                        </div>
                        <div className={styles.itemInfo}>
                            <h3 className={styles.itemName}>{t(item.name_en, item.name_ar)}</h3>
                            <div className={styles.itemMeta}>
                                <div className={styles.price}>
                                    {item.price} <small>{t('₪', 'شيكل')}</small>
                                </div>
                                <div className={styles.rating}>
                                    {item.rating || '4.8'}
                                </div>
                            </div>
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
