'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './DateTimePicker.module.css';

export default function DatePicker({ settings, hours, closures, onConfirm, initialDate }) {
    const { language } = useLanguage();
    const today = new Date();

    const [currentMonth, setCurrentMonth] = useState(() => {
        if (initialDate) {
            return new Date(initialDate.getFullYear(), initialDate.getMonth(), 1);
        }
        return new Date(today.getFullYear(), today.getMonth(), 1);
    });

    const maxAdvanceDays = settings?.max_advance_days || 30;
    const maxDate = new Date(today.getTime() + maxAdvanceDays * 86400000);

    const closureDates = useMemo(() => {
        return new Set((closures || []).map(c => c.closure_date));
    }, [closures]);

    const hoursMap = useMemo(() => {
        const map = {};
        (hours || []).forEach(h => { map[h.day_of_week] = h; });
        return map;
    }, [hours]);

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
        if (!dayHours) return true;
        return false;
    };

    const handleDateClick = (day) => {
        if (isDateDisabled(day)) return;
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        onConfirm(date);
    };

    const prevMonth = () => {
        const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
        if (prev >= new Date(today.getFullYear(), today.getMonth(), 1)) setCurrentMonth(prev);
    };

    const nextMonth = () => {
        const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
        if (next <= maxDate) setCurrentMonth(next);
    };

    return (
        <div className={styles.wrapper}>
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
                        const isToday = today.getDate() === day &&
                            today.getMonth() === currentMonth.getMonth() &&
                            today.getFullYear() === currentMonth.getFullYear();
                        const isSelected = initialDate &&
                            day === initialDate.getDate() &&
                            initialDate.getMonth() === currentMonth.getMonth() &&
                            initialDate.getFullYear() === currentMonth.getFullYear();

                        return (
                            <button
                                key={day}
                                className={`${styles.dayBtn} ${disabled ? styles.disabled : ''} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
                                onClick={() => handleDateClick(day)}
                                disabled={disabled}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
