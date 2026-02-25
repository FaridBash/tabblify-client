'use client';

import React from 'react';
import { ConciergeBell } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './ServiceBell.module.css';

const ServiceBell = () => {
    return (
        <motion.div
            className={styles.bellWrapper}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
        >
            <button className={styles.bellButton} aria-label="Call Service">
                <ConciergeBell size={28} strokeWidth={1.5} />
                <div className={styles.pulse} />
            </button>
        </motion.div>
    );
};

export default ServiceBell;
