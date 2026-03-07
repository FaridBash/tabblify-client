'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Clock, Calendar } from 'lucide-react';
import styles from './DateTimePicker.module.css';

export default function TimePicker({ selectedDate, settings, hours, onConfirm, initialTime }) {
    const { t, language } = useLanguage();
    const today = new Date();
    const bufferTime = settings?.buffer_time || 30;

    const hoursMap = useMemo(() => {
        const map = {};
        (hours || []).forEach(h => { map[h.day_of_week] = h; });
        return map;
    }, [hours]);

    const monthNames = language === 'ar'
        ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
        : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const formattedDate = selectedDate
        ? `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
        : '';

    const timeSlots = useMemo(() => {
        if (!selectedDate) return [];
        const dow = selectedDate.getDay();
        const dayHours = hoursMap[dow];
        if (!dayHours || !dayHours.is_open) return [];

        const slots = [];
        const [openH, openM] = dayHours.open_time.split(':').map(Number);
        const [closeH, closeM] = dayHours.close_time.split(':').map(Number);

        let current = openH * 60 + openM;
        const end = closeH * 60 + closeM;

        while (current < end) {
            const h = Math.floor(current / 60);
            const m = current % 60;
            const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

            const isToday = selectedDate.toDateString() === today.toDateString();
            if (!isToday || current > today.getHours() * 60 + today.getMinutes() + 30) {
                slots.push(timeStr);
            }
            current += bufferTime;
        }
        return slots;
    }, [selectedDate, hoursMap, bufferTime]);

    // Group slots into Hours and Minutes
    const hoursList = useMemo(() => {
        return [...new Set(timeSlots.map(s => s.split(':')[0]))].sort();
    }, [timeSlots]);

    const [activeHour, setActiveHour] = useState(() => {
        if (initialTime && hoursList.includes(initialTime.split(':')[0])) {
            return initialTime.split(':')[0];
        }
        return hoursList[0] || '';
    });

    const minutesList = useMemo(() => {
        return timeSlots
            .filter(s => s.startsWith(activeHour + ':'))
            .map(s => s.split(':')[1])
            .sort();
    }, [timeSlots, activeHour]);

    const [activeMin, setActiveMin] = useState(() => {
        if (initialTime && initialTime.startsWith(activeHour + ':')) {
            const m = initialTime.split(':')[1];
            if (minutesList.includes(m)) return m;
        }
        return minutesList[0] || '';
    });

    const hourRef = useRef(null);
    const minRef = useRef(null);

    // Initial Scroll Effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (hourRef.current && activeHour) {
                const hourIndex = hoursList.indexOf(activeHour);
                if (hourIndex !== -1) {
                    const firstItem = hourRef.current.querySelector(`.${styles.drumItem}`);
                    const itemHeight = firstItem ? firstItem.offsetHeight : 60;
                    hourRef.current.scrollTo({ top: hourIndex * itemHeight, behavior: 'smooth' });
                }
            }
            if (minRef.current && activeMin) {
                const minIndex = minutesList.indexOf(activeMin);
                if (minIndex !== -1) {
                    const firstItem = minRef.current.querySelector(`.${styles.drumItem}`);
                    const itemHeight = firstItem ? firstItem.offsetHeight : 60;
                    minRef.current.scrollTo({ top: minIndex * itemHeight, behavior: 'smooth' });
                }
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [hoursList, minutesList]); // Run once when lists are ready

    // Reset minute if not available for new hour
    useEffect(() => {
        if (!minutesList.includes(activeMin)) {
            setActiveMin(minutesList[0] || '');
        }
    }, [activeHour, minutesList]);

    const handleScroll = (ref, list, setter) => {
        if (!ref.current) return;
        const top = ref.current.scrollTop;
        // Detect actual item height from the first child or fallback to CSS defaults
        const firstItem = ref.current.querySelector(`.${styles.drumItem}`);
        const itemHeight = firstItem ? firstItem.offsetHeight : (window.innerHeight < 600 ? 50 : 60);
        const index = Math.round(top / itemHeight);
        if (list[index] && list[index] !== setter) {
            setter(list[index]);
        }
    };

    const handleConfirm = () => {
        if (activeHour && activeMin) {
            onConfirm(`${activeHour}:${activeMin}`);
        }
    };

    return (
        <div className={styles.wrapper}>
            {timeSlots.length === 0 ? (
                <p className={styles.noSlots}>{t('No available time slots for this date', 'لا توجد أوقات متاحة لهذا التاريخ')}</p>
            ) : (
                <div className={styles.drumPickerContainer}>
                    <div className={styles.drumPicker}>
                        {/* Selector Overlay */}
                        <div className={styles.drumOverlay} />

                        {/* Hours Column */}
                        <div
                            className={styles.drumColumn}
                            ref={hourRef}
                            onScroll={() => handleScroll(hourRef, hoursList, setActiveHour)}
                        >
                            <div className={styles.drumPadding} />
                            {hoursList.map(h => (
                                <div key={h} className={`${styles.drumItem} ${h === activeHour ? styles.drumActive : ''}`}>
                                    {h}
                                </div>
                            ))}
                            <div className={styles.drumPadding} />
                        </div>

                        <div className={styles.drumSeparator}>:</div>

                        {/* Minutes Column */}
                        <div
                            className={styles.drumColumn}
                            ref={minRef}
                            onScroll={() => handleScroll(minRef, minutesList, setActiveMin)}
                        >
                            <div className={styles.drumPadding} />
                            {minutesList.map(m => (
                                <div key={m} className={`${styles.drumItem} ${m === activeMin ? styles.drumActive : ''}`}>
                                    {m}
                                </div>
                            ))}
                            <div className={styles.drumPadding} />
                        </div>
                    </div>

                    <button
                        className={styles.confirmTimeBtn}
                        onClick={handleConfirm}
                    >
                        {t('Set Time', 'تحديد الوقت')}
                    </button>
                </div>
            )}
        </div>
    );
}
