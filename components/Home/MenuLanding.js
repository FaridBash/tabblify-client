'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useUI } from '@/context/UIContext';
import { motion } from 'framer-motion';
import styles from './MenuLanding.module.css';
import OrgBranding from './OrgBranding';

const MenuLanding = ({ initialMenus, title, subtitle }) => {
    const { t } = useLanguage();
    const { uiConfig, tableData } = useUI();

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

    const getMenuHref = (menu) => {
        const typeParam = menu.menu_type?.toLowerCase() === 'pdf' ? '?type=pdf' : '';
        return tableData?.table_hash 
            ? `/t/${tableData.table_hash}/menu/${menu.id}${typeParam}` 
            : `/menus/${menu.id}${typeParam}`;
    };

    return (
        <div className={styles.container}>
            <OrgBranding uiConfig={uiConfig} title={title} subtitle={subtitle} />

            <motion.div
                className={styles.list}
                variants={container}
                initial="hidden"
                animate="show"
            >
                {initialMenus.map((menu) => (
                    <motion.div key={menu.id} variants={item} className={styles.itemWrapper}>
                        <Link href={getMenuHref(menu)} className={`${styles.menuPill} glass-card glass-card-hover`}>
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

export default MenuLanding;
