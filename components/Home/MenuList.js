'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useUI } from '@/context/UIContext';
import { motion } from 'framer-motion';
import { UtensilsCrossed } from 'lucide-react';
import styles from './MenuList.module.css';

const MenuList = ({ initialMenus }) => {
    const { t } = useLanguage();
    const ui = useUI();
    const tableData = ui?.tableData;
    const organization = ui?.organization;
    const basePath = organization?.slug ? `/${organization.slug}` : '';

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
            : `${basePath}/menus/${menu.id}${typeParam}`;
    };

    return (
        <div className={styles.container}>
            <motion.div 
                className={styles.heroSection}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className={styles.iconCircle}>
                    <UtensilsCrossed size={48} className={styles.heroIcon} />
                </div>
            </motion.div>

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

export default MenuList;
