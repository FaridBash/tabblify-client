'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './DateTimePicker.module.css';

export default function DateTimePicker({ settings, hours, closures, onConfirm }) {
    const { t, language } = useLanguage();
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    const maxAdvanceDays = settings?.max_advance_days || 30;
    const bufferTime = settings?.buffer_time || 30;
    const maxDate = new Date(today.getTime() + maxAdvanceDays * 86400000);

    // Build closure date set
    const closureDates = useMemo(() => {
        return new Set((closures || []).map(c => c.closure_date));
    }, [closures]);

    // Build hours map (day_of_week 0=Sunday ... 6=Saturday)
    const hoursMap = useMemo(() => {
        const map = {};
        (hours || []).forEach(h => { map[h.day_of_week] = h; });
        return map;
    }, [hours]);

    // Calendar helpers
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const monthNames = language === 'ar'
        ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
        : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayLabels = language === 'ar'
        ? ['أح', 'اث', 'ثل', 'أر', 'خم', 'جم', 'سب']
        : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const isDateDisabled = (day) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dateStr = date.toISOString().split('T')[0];
        const dow = date.getDay();
        const dayHours = hoursMap[dow];

        if (date < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return true;
        if (date > maxDate) return true;
        if (closureDates.has(dateStr)) return true;
        if (dayHours && !dayHours.is_open) return true;
        if (!dayHours) return true; // No hours set = closed
        return false;
    };

    // Generate time slots based on selected date's hours
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
        const interval = bufferTime;

        while (current < end) {
            const h = Math.floor(current / 60);
            const m = current % 60;
            const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

            // If today, skip past times
            const isToday = selectedDate.toDateString() === today.toDateString();
            if (!isToday || current > today.getHours() * 60 + today.getMinutes() + 30) {
                slots.push(timeStr);
            }
            current += interval;
        }
        return slots;
    }, [selectedDate, hoursMap, bufferTime, today]);

    const handleDateClick = (day) => {
        if (isDateDisabled(day)) return;
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        setSelectedDate(date);
        setSelectedTime(null);
    };

    const prevMonth = () => {
        const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
        if (prev >= new Date(today.getFullYear(), today.getMonth(), 1)) setCurrentMonth(prev);
    };

    const nextMonth = () => {
        const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
        if (next <= maxDate) setCurrentMonth(next);
    };

    const formatDate = (date) => {
        if (!date) return '';
        return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    };

    return (
        <div className={styles.wrapper}>
            {/* Calendar */}
            <div className={styles.calendarCard}>
                <div className={styles.calendarHeader}>
                    <button onClick={prevMonth} className={styles.navBtn}><ChevronLeft size={20} /></button>
                    <span className={styles.monthLabel}>
                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </span>
                    <button onClick={nextMonth} className={styles.navBtn}><ChevronRight size={20} /></button>
                </div>

                <div className={styles.dayLabels}>
                    {dayLabels.map(d => <span key={d}>{d}</span>)}
                </div>

                <div className={styles.daysGrid}>
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className={styles.emptyDay} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const disabled = isDateDisabled(day);
                        const isSelected = selectedDate?.getDate() === day &&
                            selectedDate?.getMonth() === currentMonth.getMonth() &&
                            selectedDate?.getFullYear() === currentMonth.getFullYear();
                        const isToday = today.getDate() === day &&
                            today.getMonth() === currentMonth.getMonth() &&
                            today.getFullYear() === currentMonth.getFullYear();

                        return (
                            <button
                                key={day}
                                className={`${styles.dayBtn} ${disabled ? styles.disabled : ''} ${isSelected ? styles.selected : ''} ${isToday ? styles.today : ''}`}
                                onClick={() => handleDateClick(day)}
                                disabled={disabled}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
                <div className={styles.timeSection}>
                    <h3 className={styles.timeLabel}>
                        <Clock size={18} />
                        {t('Available Times for', 'الأوقات المتاحة لـ')} {formatDate(selectedDate)}
                    </h3>
                    {timeSlots.length === 0 ? (
                        <p className={styles.noSlots}>{t('No available time slots', 'لا توجد أوقات متاحة')}</p>
                    ) : (
                        <div className={styles.timeSlotsGrid}>
                            {timeSlots.map(time => (
                                <button
                                    key={time}
                                    className={`${styles.timeSlot} ${selectedTime === time ? styles.selectedTime : ''}`}
                                    onClick={() => setSelectedTime(time)}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Confirm Button */}
            {selectedDate && selectedTime && (
                <button
                    className={styles.confirmBtn}
                    onClick={() => onConfirm(selectedDate, selectedTime)}
                >
                    <Calendar size={20} />
                    {t('Continue to Table Selection', 'متابعة لاختيار الطاولة')}
                </button>
            )}
        </div>
    );
}
