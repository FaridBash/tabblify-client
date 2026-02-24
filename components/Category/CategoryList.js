'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useUI } from '@/context/UIContext';
import { motion } from 'framer-motion';
import styles from './CategoryList.module.css';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const CategoryList = ({ initialCategories, menu }) => {
    const { language, t } = useLanguage();
    const { setHeaderTitle } = useUI();

    useEffect(() => {
        // Set global header title
        setHeaderTitle(t(menu?.name_en || menu?.title_en, menu?.name_ar || menu?.title_ar));

        // Clear title on unmount
        return () => setHeaderTitle('');
    }, [menu, t, setHeaderTitle]);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div className={styles.wrapper}>
            <motion.div
                className={styles.list}
                variants={container}
                initial="hidden"
                animate="show"
            >
                {initialCategories.map((category) => (
                    <motion.div key={category.id} variants={item}>
                        <Link
                            href={`/menu/${menu.id}/${category.id}`}
                            className={`${styles.categoryCard} glass-card glass-card-hover`}
                        >
                            {category.image_url && (
                                <div className={styles.imageWrapper}>
                                    <img src={category.image_url} alt={category.name_en} className={styles.categoryImage} />
                                </div>
                            )}

                            <div className={styles.cardInfo}>
                                <h3 className={styles.categoryName}>{t(category.name_en, category.name_ar)}</h3>
                                {category.description_en && (
                                    <p className={styles.categoryDesc}>
                                        {t(category.description_en, category.description_ar)}
                                    </p>
                                )}
                            </div>

                            <div className={styles.chevronWrapper}>
                                {language === 'ar' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default CategoryList;
