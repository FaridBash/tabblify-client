'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { User, Phone, Users, Clock, Send, Mail } from 'lucide-react';
import styles from './ReservationForm.module.css';

export default function ReservationForm({ table, date, time, settings, onComplete, editingReservation }) {
    const { t } = useLanguage();
    const bufferTime = settings?.buffer_time || 60;
    const minParty = settings?.min_party_size || 1;
    const maxParty = settings?.max_party_size || Math.min(table.capacity, 20);
    const autoConfirm = settings?.auto_confirm ?? false;
    const isEditing = !!editingReservation;

    // Calculate default end time
    const [h, m] = time.split(':').map(Number);
    const defaultEndMin = h * 60 + m + bufferTime;
    const defaultEnd = `${String(Math.floor(defaultEndMin / 60)).padStart(2, '0')}:${String(defaultEndMin % 60).padStart(2, '0')}`;

    // Pre-fill from editingReservation if available
    const [name, setName] = useState(editingReservation?.customer_name || '');
    const [email, setEmail] = useState(editingReservation?.customer_email || '');
    const [phone, setPhone] = useState(editingReservation?.customer_phone || '');
    const [age, setAge] = useState(editingReservation?.customer_age?.toString() || '');
    const [partySize, setPartySize] = useState(
        editingReservation?.party_size || Math.min(2, maxParty)
    );
    const [endTime, setEndTime] = useState(() => {
        if (editingReservation?.end_time) {
            return editingReservation.end_time.split(':').slice(0, 2).join(':');
        }
        return defaultEnd;
    });
    const [notes, setNotes] = useState(editingReservation?.notes || '');
    const [termsAccepted, setTermsAccepted] = useState(isEditing ? true : false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Generate end time options (from start_time + 30m up to max duration or close)
    const endTimeOptions = [];
    const limitMin = table.maxDuration ? (h * 60 + m + table.maxDuration * 60) : (h * 60 + m + 240); // Default 4h if no info

    for (let t = h * 60 + m + 30; t <= limitMin; t += 30) {
        const hh = Math.floor(t / 60);
        const mm = t % 60;
        if (hh >= 24) break;
        endTimeOptions.push(`${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) { setError(t('Name is required', 'الاسم مطلوب')); return; }
        if (!email.trim()) { setError(t('Email is required', 'البريد الإلكتروني مطلوب')); return; }
        if (!phone.trim()) { setError(t('Phone is required', 'رقم الهاتف مطلوب')); return; }
        if (!age) { setError(t('Age is required', 'العمر مطلوب')); return; }
        if (!termsAccepted) { setError(t('You must accept the terms', 'يجب الموافقة على الشروط')); return; }
        if (partySize > table.capacity) {
            setError(t(`Max capacity for this table is ${table.capacity}`, `السعة القصوى لهذه الطاولة هي ${table.capacity}`));
            return;
        }

        setSubmitting(true);
        try {
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const payload = {
                table_id: table.id,
                customer_name: name.trim(),
                customer_email: email.trim(),
                customer_phone: phone.trim(),
                customer_age: parseInt(age, 10),
                party_size: partySize,
                reservation_date: dateStr,
                start_time: time,
                end_time: endTime,
                notes: notes.trim() || null,
            };

            let data;
            if (isEditing) {
                // Update existing reservation
                payload.status = editingReservation.status; // Keep original status
                const { data: updated, error: dbError } = await supabase
                    .from('reservations')
                    .update(payload)
                    .eq('id', editingReservation.id)
                    .select()
                    .single();
                if (dbError) throw dbError;
                data = updated;
            } else {
                // Create new reservation
                payload.status = autoConfirm ? 'confirmed' : 'pending';
                const { data: inserted, error: dbError } = await supabase
                    .from('reservations')
                    .insert(payload)
                    .select()
                    .single();
                if (dbError) throw dbError;
                data = inserted;
            }

            // Persist customer identity for my-reservations lookup
            localStorage.setItem('restaurant_customer_email', email.trim());
            localStorage.setItem('restaurant_customer_phone', phone.trim());

            onComplete({
                ...data,
                tableLabel: table.label,
                tableCapacity: table.capacity,
                autoConfirmed: isEditing ? (data.status === 'confirmed') : autoConfirm,
            });
        } catch (err) {
            console.error('Reservation error:', err);
            setError(
                isEditing
                    ? t('Failed to update reservation. Please try again.', 'فشل في تحديث الحجز. يرجى المحاولة مرة أخرى.')
                    : t('Failed to submit reservation. Please try again.', 'فشل في إرسال الحجز. يرجى المحاولة مرة أخرى.')
            );
        } finally {
            setSubmitting(false);
        }
    };

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;

    return (
        <div className={styles.wrapper}>
            {/* Selected Table Summary */}
            <div className={styles.summary}>
                <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>{t('Table', 'الطاولة')}</span>
                    <span className={styles.summaryValue}>#{table.label}</span>
                </div>
                <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>{t('Date', 'التاريخ')}</span>
                    <span className={styles.summaryValue}>{formattedDate}</span>
                </div>
                <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>{t('Time', 'الوقت')}</span>
                    <span className={styles.summaryValue}>{time}</span>
                </div>
                <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>{t('Capacity', 'السعة')}</span>
                    <span className={styles.summaryValue}>{table.capacity}p</span>
                </div>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.field}>
                    <label className={styles.label}>
                        <User size={16} /> {t('Full Name', 'الاسم الكامل')}
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('Enter your name', 'أدخل اسمك')}
                        className={styles.input}
                        required
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>
                        <Mail size={16} /> {t('Email Address', 'البريد الإلكتروني')}
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('Enter your email', 'أدخل بريدك الإلكتروني')}
                        className={styles.input}
                        required
                    />
                </div>

                <div className={styles.row}>
                    <div className={styles.field}>
                        <label className={styles.label}>
                            <Phone size={16} /> {t('Phone Number', 'رقم الهاتف')}
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder={t('+961 XX XXX XXX', '+961 XX XXX XXX')}
                            className={styles.input}
                            required
                        />
                    </div>
                    <div className={styles.field} style={{ flex: 0.5 }}>
                        <label className={styles.label}>
                            <User size={16} /> {t('Age', 'العمر')}
                        </label>
                        <input
                            type="number"
                            min="15"
                            max="100"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            placeholder={t('18+', '18+')}
                            className={styles.input}
                            required
                        />
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.field}>
                        <label className={styles.label}>
                            <Users size={16} /> {t('Party Size', 'عدد الأشخاص')}
                        </label>
                        <select
                            value={partySize}
                            onChange={(e) => setPartySize(Number(e.target.value))}
                            className={styles.select}
                        >
                            {Array.from({ length: Math.min(maxParty, table.capacity) - minParty + 1 }).map((_, i) => (
                                <option key={i} value={minParty + i}>{minParty + i}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>
                            <Clock size={16} /> {t('Until', 'حتى الساعة')}
                        </label>
                        <select
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className={styles.select}
                        >
                            {endTimeOptions.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        {table.maxDuration && (
                            <p className={styles.limitInfo}>
                                {t('Limited to', 'محدد بـ')} {table.maxDuration} {t('h due to next reservation', 'ساعة بسبب الحجز التالي')}
                            </p>
                        )}
                    </div>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>{t('Notes (optional)', 'ملاحظات (اختياري)')}</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={t('Any special requests...', 'أي طلبات خاصة...')}
                        className={styles.textarea}
                        rows={3}
                    />
                </div>

                <div className={styles.checkboxContainer}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className={styles.checkbox}
                            required
                        />
                        <span className={styles.checkboxText}>
                            {t('I agree to the ', 'أوافق على ')}
                            <a href="#" target="_blank" className={styles.link} onClick={e => e.stopPropagation()}>
                                {t('Terms of Use', 'شروط الاستخدام')}
                            </a>
                            {t(' and ', ' و ')}
                            <a href="#" target="_blank" className={styles.link} onClick={e => e.stopPropagation()}>
                                {t('Privacy Policy', 'سياسة الخصوصية')}
                            </a>
                        </span>
                    </label>
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                    <Send size={18} />
                    {submitting
                        ? (isEditing
                            ? t('Updating...', 'جاري التحديث...')
                            : t('Submitting...', 'جاري الإرسال...'))
                        : (isEditing
                            ? t('Update Reservation', 'تحديث الحجز')
                            : t('Confirm Reservation', 'تأكيد الحجز'))
                    }
                </button>
            </form>
        </div>
    );
}
