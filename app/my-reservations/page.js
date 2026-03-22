'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { useUI } from '@/context/UIContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, MapPin,
    Users, X, Pencil, Trash2, CalendarOff, Plus, AlertCircle, Search, ArrowRight
} from 'lucide-react';
import styles from './page.module.css';

export default function MyReservationsPage() {
    const router = useRouter();
    const { t, language } = useLanguage();
    const { setHeaderTitle, organization } = useUI();


    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRes, setSelectedRes] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [emailInput, setEmailInput] = useState('');
    const [noResultsFound, setNoResultsFound] = useState(false);

    // Set the header title via the existing app Header
    useEffect(() => {
        setHeaderTitle(t('My Reservations', 'حجوزاتي'));
        return () => setHeaderTitle('');
    }, [setHeaderTitle, t]);

    useEffect(() => {
        if (organization && !organization.features?.includes('reservations')) {
            router.push('/');
        }
    }, [organization, router]);

    const fetchReservations = useCallback(async (emailOverride = null) => {
        if (!organization) return;

        // On initial load, try localStorage. If user searched, use the override.
        const storedEmail = localStorage.getItem('restaurant_customer_email');
        const email = emailOverride || storedEmail;
        const phone = localStorage.getItem('restaurant_customer_phone');

        // Only search if we have a target
        if (!email && !phone) {
            setReservations([]);
            setLoading(false);
            return;
        }

        if (!supabase) {
            setLoading(false);
            setErrorMsg(t('Service temporarily unavailable', 'الخدمة غير متوفرة حالياً'));
            return;
        }

        try {
            setLoading(true);
            setErrorMsg(null);
            setNoResultsFound(false);

            const today = new Date().toISOString().split('T')[0];

            let query = supabase.from('reservations')
                .select('*')
                .eq('organization_id', organization.id)
                .gte('reservation_date', today);

            if (email && phone) {
                query = query.or(`customer_email.eq.${email},customer_phone.eq.${phone}`);
            } else if (email) {
                query = query.eq('customer_email', email);
            } else {
                query = query.eq('customer_phone', phone);
            }

            const { data: resData, error: resError } = await query.order('reservation_date', { ascending: true });

            if (resError) throw resError;

            if (emailOverride && resData && resData.length > 0) {
                localStorage.setItem('restaurant_customer_email', emailOverride);
            }

            if (!resData || resData.length === 0) {
                setReservations([]);
                if (emailOverride) {
                    setNoResultsFound(true);
                }
                setLoading(false);
                return;
            }

            const tableIds = [...new Set(resData.map(r => r.table_id).filter(Boolean))];
            let tableMap = {};

            if (tableIds.length > 0) {
                const { data: tableData } = await supabase
                    .from('tables')
                    .select('id, table_number, capacity')
                    .eq('organization_id', organization.id)
                    .in('id', tableIds);

                if (tableData) {
                    tableData.forEach(t => {
                        tableMap[t.id] = { ...t, label: t.table_number?.toString() || '' };
                    });
                }
            }

            const merged = resData.map(r => ({ ...r, tables: tableMap[r.table_id] || null }));
            setReservations(merged);
        } catch (err) {
            console.error('Fetch Error:', err);
            setErrorMsg(t('Unable to fetch reservations.', 'فشل في جلب الحجوزات.'));
            setReservations([]);
        } finally {
            setLoading(false);
        }
    }, [t, organization]); // Removed emailInput from dependencies

    const handleSearch = (e) => {
        e.preventDefault();
        const trimEmail = emailInput.trim();
        if (!trimEmail) return;
        fetchReservations(trimEmail);
    };

    const clearSearch = () => {
        setEmailInput('');
        setNoResultsFound(false);
        localStorage.removeItem('restaurant_customer_email');
        setReservations([]);
    };

    useEffect(() => {
        fetchReservations(); // Initial load from localStorage
    }, [fetchReservations]);

    const handleCancel = async (id) => {
        if (!supabase) return;
        setCancelling(true);
        try {
            const { error } = await supabase
                .from('reservations')
                .update({ status: 'cancelled' })
                .eq('id', id);
            if (error) throw error;

            setReservations(prev =>
                prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r)
            );
            setSelectedRes(null);
        } catch (err) {
            console.error('Cancel error:', err);
        } finally {
            setCancelling(false);
        }
    };

    const handleEdit = (res) => {
        sessionStorage.setItem('editing_reservation', JSON.stringify(res));
        router.push(`/reserve?edit=${res.id}`);
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        const months = language === 'ar'
            ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
            : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    };

    const formatTime = (t) => {
        if (!t) return '';
        return t.split(':').slice(0, 2).join(':');
    };

    const statusLabel = (status) => {
        const map = {
            confirmed: t('Confirmed', 'مؤكد'),
            pending: t('Pending', 'في الانتظار'),
            cancelled: t('Cancelled', 'ملغي'),
        };
        return map[status] || status;
    };

    const statusClass = (status) => {
        if (status === 'confirmed') return styles.statusConfirmed;
        if (status === 'pending') return styles.statusPending;
        return styles.statusCancelled;
    };

    return (
        <div className={styles.container}>
            {/* Global style overrides for this page to prevent unneeded scrolling */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .main-content {
                    padding-bottom: 0 !important;
                    height: 100% !important;
                    display: flex !important;
                    flex-direction: column !important;
                }
            `}} />

            {/* Content Area */}
            <div className={styles.content}>
                {/* Search Section */}
                <form className={styles.searchSection} onSubmit={handleSearch}>
                    <label className={styles.searchLabel}>
                        {t('Find by Email', 'البحث بالبريد الإلكتروني')}
                    </label>
                    <div className={styles.searchBox}>
                        <Search className={styles.searchIcon} size={18} style={{ position: 'absolute', left: '12px', opacity: 0.4 }} />
                        <input
                            type="email"
                            className={styles.searchInput}
                            style={{ paddingLeft: '40px' }}
                            placeholder={t('Enter your email address', 'أدخل بريدك الإلكتروني')}
                            value={emailInput}
                            onChange={(e) => {
                                setEmailInput(e.target.value);
                                if (noResultsFound) setNoResultsFound(false);
                            }}
                        />
                        {emailInput && (
                            <button type="button" className={styles.clearBtn} onClick={clearSearch}>
                                <X size={16} />
                            </button>
                        )}
                        <button type="submit" className={styles.searchBtn} disabled={!emailInput.trim() || loading}>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                    {noResultsFound && (
                        <p className={styles.searchError}>
                            {t('No future reservations found for this email.', 'لم يتم العثور على حجوزات مستقبلية لهذا البريد.')}
                        </p>
                    )}
                </form>

                {loading ? null : errorMsg ? (
                    <div className={styles.errorState}>
                        <AlertCircle size={48} color="#ef4444" opacity={0.5} />
                        <p>{errorMsg}</p>
                        <button className={styles.retryBtn} onClick={() => fetchReservations()}>
                            {t('Try Again', 'إعادة المحاولة')}
                        </button>
                    </div>
                ) : reservations.length === 0 ? (
                    <motion.div
                        className={styles.emptyState}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <CalendarOff size={64} className={styles.emptyIcon} />
                        <h2 className={styles.emptyTitle}>
                            {t('No Reservations Yet', 'لا توجد حجوزات بعد')}
                        </h2>
                        <p className={styles.emptySubtitle}>
                            {t(
                                'You haven\'t made any reservations. Book a table to get started!',
                                'لم تقم بحجز أي طاولة. احجز طاولة للبدء!'
                            )}
                        </p>
                        <button
                            className={styles.emptyButton}
                            onClick={() => router.push('/reserve')}
                        >
                            <Plus size={18} />
                            {t('Reserve a Table', 'احجز طاولة')}
                        </button>
                    </motion.div>
                ) : (
                    <AnimatePresence>
                        {reservations.map((res, i) => (
                            <motion.div
                                key={res.id}
                                className={styles.card}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => setSelectedRes(res)}
                            >
                                <div className={styles.cardHeader}>
                                    <span className={styles.cardDate}>
                                        {formatDate(res.reservation_date)}
                                    </span>
                                    <span className={`${styles.cardStatus} ${statusClass(res.status)}`}>
                                        {statusLabel(res.status)}
                                    </span>
                                </div>
                                <div className={styles.cardInfo}>
                                    <span className={styles.cardChip}>
                                        <Clock size={14} />
                                        {formatTime(res.start_time)} – {formatTime(res.end_time)}
                                    </span>
                                    <span className={styles.cardChip}>
                                        <Users size={14} />
                                        {res.party_size}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Reservation Detail Modal */}
            <AnimatePresence>
                {selectedRes && (
                    <div className={styles.modalOverlay} onClick={() => setSelectedRes(null)}>
                        <motion.div
                            className={styles.modalCard}
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.92, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.modalHeader}>
                                <h2 className={styles.modalTitle}>
                                    {t('Reservation Details', 'تفاصيل الحجز')}
                                </h2>
                                <button
                                    className={styles.modalClose}
                                    onClick={() => setSelectedRes(null)}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className={styles.modalDetails}>
                                <div className={styles.modalRow}>
                                    <Calendar size={18} />
                                    <span>{formatDate(selectedRes.reservation_date)}</span>
                                </div>
                                <div className={styles.modalRow}>
                                    <Clock size={18} />
                                    <span>{formatTime(selectedRes.start_time)} – {formatTime(selectedRes.end_time)}</span>
                                </div>

                                <div className={styles.modalRow}>
                                    <Users size={18} />
                                    <span>{selectedRes.party_size} {t('guests', 'أشخاص')}</span>
                                </div>
                            </div>

                            <div className={`${styles.modalStatusBadge} ${statusClass(selectedRes.status)}`}>
                                {statusLabel(selectedRes.status)}
                            </div>

                            {selectedRes.notes && (
                                <div className={styles.modalNotes}>
                                    <span className={styles.modalNotesLabel}>
                                        {t('Notes', 'ملاحظات')}
                                    </span>
                                    {selectedRes.notes}
                                </div>
                            )}

                            {selectedRes.status !== 'cancelled' && (
                                <div className={styles.modalActions}>
                                    <button
                                        className={styles.editBtn}
                                        onClick={() => handleEdit(selectedRes)}
                                    >
                                        <Pencil size={16} />
                                        {t('Edit', 'تعديل')}
                                    </button>
                                    <button
                                        className={styles.cancelBtn}
                                        onClick={() => handleCancel(selectedRes.id)}
                                        disabled={cancelling}
                                    >
                                        <Trash2 size={16} />
                                        {cancelling
                                            ? t('Cancelling...', 'جاري الإلغاء...')
                                            : t('Cancel', 'إلغاء')
                                        }
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
