'use client';

import React, { useState } from 'react';
import { ConciergeBell, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUI } from '@/context/UIContext';
import { supabase } from '@/lib/supabase';
import styles from './ServiceBell.module.css';

const ServiceBell = () => {
    const { tableData, guestId } = useUI();
    const [status, setStatus] = useState('idle'); // idle, sending, sent

    const handleCallService = async () => {
        if (!tableData?.id || !guestId || status !== 'idle') return;

        setStatus('sending');
        try {
            const { error } = await supabase
                .from('service_requests')
                .insert([
                    {
                        table_id: tableData.id,
                        guest_id: guestId,
                        status: 'pending',
                        role_id: 2, // res-waiter
                        type: 'call_waiter'
                    }
                ]);

            if (error) throw error;

            setStatus('sent');
            // Reset after 3 seconds
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err) {
            console.error('Error calling service:', err);
            setStatus('idle');
        }
    };

    return (
        <motion.div
            className={styles.bellWrapper}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
        >
            <button
                className={`${styles.bellButton} ${styles[status]}`}
                onDoubleClick={handleCallService}
                aria-label="Call Service"
                disabled={status === 'sending'}
            >
                <AnimatePresence mode="wait">
                    {status === 'sending' ? (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0, rotate: 0 }}
                            animate={{ opacity: 1, rotate: 360 }}
                            exit={{ opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                            <Loader2 size={28} />
                        </motion.div>
                    ) : status === 'sent' ? (
                        <motion.div
                            key="check"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                        >
                            <Check size={28} strokeWidth={3} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="bell"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <ConciergeBell size={28} strokeWidth={1.5} />
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className={`${styles.pulse} ${styles[status]}`} />
            </button>

            {/* Tooltip hint */}
            <div className={styles.hint}>
                {status === 'sent' ? 'Waitress Notified!' : 'Double Click to Call'}
            </div>
        </motion.div>
    );
};

export default ServiceBell;
