'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import styles from './PublicMenuList.module.css';

const PublicMenuList = ({ initialMenus }) => {
    const { t } = useLanguage();

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            className={styles.list}
            variants={container}
            initial="hidden"
            animate="show"
        >
            {initialMenus.map((menu) => (
                <motion.div key={menu.id} variants={item} className={styles.itemWrapper}>
                    <Link href={`/menus/${menu.id}`} className={`${styles.menuPill} glass-card glass-card-hover`}>
                        <span className={styles.menuTitle}>
                            {t(menu.name_en || menu.title_en, menu.name_ar || menu.title_ar)}
                        </span>
                    </Link>
                </motion.div>
            ))}
        </motion.div>
    );
};

export default PublicMenuList;
