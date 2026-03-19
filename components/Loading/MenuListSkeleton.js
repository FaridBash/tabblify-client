'use client';

import React from 'react';
import styles from './MenuListSkeleton.module.css';
import { motion } from 'framer-motion';

const MenuListSkeleton = () => {
    return (
        <div className={styles.container}>
            <div className={styles.list}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={styles.itemWrapper}>
                        <motion.div 
                            className={`${styles.skeletonPill} glass-card`}
                            initial={{ opacity: 0.5 }}
                            animate={{ opacity: [0.4, 0.7, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MenuListSkeleton;
