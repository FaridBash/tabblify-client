'use client';

import React, { useState, useEffect } from 'react';
import { ConciergeBell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUI } from '@/context/UIContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import { usePathname } from 'next/navigation';
import styles from './ServiceBell.module.css';

const ServiceBell = () => {
    const { tableData, guestId } = useUI();
    const { t } = useLanguage();
    const [status, setStatus] = useState('idle'); // idle, sending, sent, in-progress, completed
    const pathname = usePathname();

    // Hide bell if not in a table session directory
    if (!pathname.startsWith('/t/')) {
        return null;
    }

    // Real-time listener
    useEffect(() => {
        if (!tableData?.id || !guestId) return;

        // Initial Check: See if there's an active request already
        const fetchInitialStatus = async () => {
            const { data, error } = await supabase
                .from('service_requests')
                .select('status')
                .eq('guest_id', guestId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (data?.[0] && !error) {
                const latestStatus = data[0].status;
                if (latestStatus === 'in-progress') {
                    setStatus('in-progress');
                } else if (latestStatus === 'pending') {
                    setStatus('sent');
                }
            }
        };

        fetchInitialStatus();

        // Real-time Subscription
        const channel = supabase
            .channel(`service-requests-${guestId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'service_requests',
                    filter: `guest_id=eq.${guestId}`
                },
                (payload) => {
                    const newStatus = payload.new?.status || payload.old?.status;
                    if (newStatus === 'completed') {
                        setStatus('completed');
                        // Return to idle after 4 seconds
                        setTimeout(() => setStatus('idle'), 4000);
                    } else if (newStatus === 'in-progress') {
                        setStatus('in-progress');
                    } else if (newStatus === 'pending') {
                        setStatus('sent');
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [tableData?.id, guestId]);

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

            // Only update to 'sent' if a real-time update hasn't already moved us forward
            setStatus(prev => prev === 'sending' ? 'sent' : prev);

            // Auto-clear 'sent' after 3s if no waiter responds
            setTimeout(() => {
                setStatus(prev => prev === 'sent' ? 'idle' : prev);
            }, 3000);
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
                aria-label={t('Call Service', 'طلب الخدمة')}
                disabled={status === 'sending' || status === 'sent' || status === 'in-progress'}
            >
                <motion.div
                    key="bell"
                    animate={status === 'sending' ? { rotate: [0, -15, 15, -15, 15, 0] } : { rotate: 0 }}
                    transition={status === 'sending' ? {
                        repeat: Infinity,
                        duration: 0.6,
                        ease: "easeInOut"
                    } : {}}
                    style={{ originY: 0 }}
                >
                    <ConciergeBell size={28} strokeWidth={1.5} />
                </motion.div>

                <div className={`${styles.pulse} ${styles[status]}`} />
            </button>

            {/* Tooltip hint */}
            <div className={styles.hint}>
                {status === 'sending' ? t('Sending...', 'جاري الإرسال...') :
                    status === 'sent' ? t('Waitress Notified!', 'تم إبلاغ النادلة!') :
                        status === 'in-progress' ? t('Waitress is coming...', 'النادلة في طريقها إليك...') :
                            status === 'completed' ? t('Request Finished!', 'تم الطلب!') :
                                t('Double Click to Call', 'انقر مرتين للمناداة')}
            </div>
        </motion.div>
    );
};

export default ServiceBell;
