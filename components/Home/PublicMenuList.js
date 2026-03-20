'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useUI } from '@/context/UIContext';
import { motion } from 'framer-motion';
import { UtensilsCrossed } from 'lucide-react';
import styles from './PublicMenuList.module.css';

const PublicMenuList = ({ initialMenus }) => {
    const { t } = useLanguage();
    const { uiConfig, setHeaderTitle, organization } = useUI();


    React.useEffect(() => {
        const title = t(uiConfig?.main_menu_button_en, uiConfig?.main_menu_button_ar) || t('View Our Menus', 'عرض قوائمنا');
        setHeaderTitle(title);
        // Clear title on unmount if needed, or leave it for the next page to set
    }, [t, uiConfig, setHeaderTitle]);

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
        <div className={styles.wrapper}>
            {/* Hero Section removed as per user request */}

            <motion.div
                className={styles.list}
                variants={container}
                initial="hidden"
                animate="show"
            >
                {initialMenus.map((menu) => (
                    <motion.div key={menu.id} variants={item} className={styles.itemWrapper}>
                        <Link 
                            href={`/menus/${menu.id}${menu.menu_type?.toLowerCase() === 'pdf' ? '?type=pdf' : ''}`} 
                            className={`${styles.menuPill} glass-card glass-card-hover`}
                        >
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

export default PublicMenuList;
