'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { CheckCircle, Clock, Calendar, Users, MapPin, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './Confirmation.module.css';

export default function Confirmation({ reservation, isEditing }) {
    const { t } = useLanguage();
    const router = useRouter();

    if (!reservation) return null;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const date = new Date(reservation.reservation_date || new Date());
    const formattedDate = `${date.getUTCDate()} ${monthNames[date.getUTCMonth()]} ${date.getUTCFullYear()}`;

    // Helper to remove seconds if present (HH:mm:ss -> HH:mm)
    const formatTimePart = (t) => {
        if (!t) return '';
        return t.split(':').slice(0, 2).join(':');
    };

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
                    {isEditing
                        ? t('Reservation Updated!', 'تم تحديث الحجز!')
                        : (reservation.autoConfirmed
                            ? t('Reservation Confirmed!', 'تم تأكيد الحجز!')
                            : t('Reservation Submitted!', 'تم إرسال الحجز!'))
                    }
                </h2>

                {!isEditing && !reservation.autoConfirmed && (
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
                        <span>{formatTimePart(reservation.start_time)} – {formatTimePart(reservation.end_time)}</span>
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

                <div style={{ display: 'flex', gap: 10, width: '100%', flexDirection: 'column', alignItems: 'center' }}>
                    {isEditing && (
                        <button className={styles.homeBtn} onClick={() => router.push('/my-reservations')}>
                            <ArrowLeft size={18} />
                            {t('Back to My Reservations', 'العودة لحجوزاتي')}
                        </button>
                    )}
                    <button className={styles.homeBtn} onClick={() => router.push('/')}>
                        <Home size={18} />
                        {t('Back to Home', 'العودة للرئيسية')}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
