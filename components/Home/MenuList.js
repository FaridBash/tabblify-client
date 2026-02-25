'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useUI } from '@/context/UIContext';
import { motion } from 'framer-motion';
import styles from './MenuList.module.css';

const MenuList = ({ initialMenus }) => {
    const { t } = useLanguage();
    const ui = useUI();
    const tableData = ui?.tableData;

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

    const getMenuHref = (menuId) => {
        const base = `/menu/${menuId}`;
        return tableData?.table_hash ? `${base}?t=${tableData.table_hash}` : base;
    };

    return (
        <div className={styles.container}>
            <motion.div
                className={styles.list}
                variants={container}
                initial="hidden"
                animate="show"
            >
                {initialMenus.map((menu) => (
                    <motion.div key={menu.id} variants={item} className={styles.itemWrapper}>
                        <Link href={getMenuHref(menu.id)} className={`${styles.menuPill} glass-card glass-card-hover`}>
                            <span className={styles.menuTitle}>
                                {t(menu.name_en || menu.title_en, menu.name_ar || menu.title_ar)}
                            </span>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default MenuList;
