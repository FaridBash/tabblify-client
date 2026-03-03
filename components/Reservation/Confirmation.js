'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { CheckCircle, Clock, Calendar, Users, MapPin, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './Confirmation.module.css';

export default function Confirmation({ reservation }) {
    const { t } = useLanguage();
    const router = useRouter();

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const date = new Date(reservation.reservation_date);
    const formattedDate = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;

    return (
        <div className={styles.wrapper}>
            <motion.div
                className={styles.card}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
                <div className={styles.iconWrapper}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                    >
                        <CheckCircle size={64} className={styles.checkIcon} />
                    </motion.div>
                </div>

                <h2 className={styles.title}>
                    {reservation.autoConfirmed
                        ? t('Reservation Confirmed!', 'تم تأكيد الحجز!')
                        : t('Reservation Submitted!', 'تم إرسال الحجز!')
                    }
                </h2>

                {!reservation.autoConfirmed && (
                    <p className={styles.pendingNote}>
                        {t('Your reservation is pending confirmation from the restaurant.', 'حجزك في انتظار تأكيد من المطعم.')}
                    </p>
                )}

                <div className={styles.details}>
                    <div className={styles.detailRow}>
                        <MapPin size={18} />
                        <span>{t('Table', 'الطاولة')} #{reservation.tableLabel}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <Calendar size={18} />
                        <span>{formattedDate}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <Clock size={18} />
                        <span>{reservation.start_time} – {reservation.end_time}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <Users size={18} />
                        <span>{reservation.party_size} {t('guests', 'أشخاص')}</span>
                    </div>
                </div>

                <div className={styles.statusBadge}>
                    {reservation.autoConfirmed
                        ? t('✓ Confirmed', '✓ مؤكد')
                        : t('⏳ Pending', '⏳ في الانتظار')
                    }
                </div>

                <button className={styles.homeBtn} onClick={() => router.push('/')}>
                    <Home size={18} />
                    {t('Back to Home', 'العودة للرئيسية')}
                </button>
            </motion.div>
        </div>
    );
}
