'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useUI } from '@/context/UIContext';
import { ChevronLeft, ChevronRight, Globe, X, Check } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import DatePicker from './DatePicker';
import TimePicker from './TimePicker';
import RestaurantMap from './RestaurantMap';
import ReservationForm from './ReservationForm';
import Confirmation from './Confirmation';
import styles from './ReservationFlow.module.css';

const STEPS = { DATE: 0, TIME: 1, MAP: 2, FORM: 3, CONFIRM: 4 };

export default function ReservationFlow({ initialData }) {
    const { layouts, settings, hours, closures } = initialData;
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t, language, setLanguage } = useLanguage();
    const { uiConfig } = useUI();
    const [step, setStep] = useState(STEPS.DATE);
    const [isLangModalOpen, setIsLangModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedTable, setSelectedTable] = useState(null);
    const [reservation, setReservation] = useState(null);
    const isRTL = language === 'ar';

    // ── Editing mode ────────────────────────────────────────────
    const editId = searchParams.get('edit');
    const [editingReservation, setEditingReservation] = useState(null);
    const isEditing = !!editId;

    useEffect(() => {
        if (editId) {
            try {
                const stored = sessionStorage.getItem('editing_reservation');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setEditingReservation(parsed);
                    // Pre-fill date
                    const d = new Date(parsed.reservation_date + 'T00:00:00');
                    setSelectedDate(d);
                    // Pre-fill time
                    const timeParts = parsed.start_time?.split(':').slice(0, 2).join(':');
                    setSelectedTime(timeParts || null);

                    // Pre-fill table info if attached
                    if (parsed.tables) {
                        setSelectedTable({
                            id: parsed.tables.id,
                            label: parsed.tables.label || parsed.tables.table_number?.toString(),
                            capacity: parsed.tables.capacity,
                            // Shape will be determined by the map layout
                        });
                    }
                }
            } catch (e) {
                console.error('Error parsing editing reservation', e);
            }
        }
    }, [editId]);

    const languages = [
        { code: 'en', name: 'English', native: 'English' },
        { code: 'ar', name: 'Arabic', native: 'العربية' }
    ];

    const handleLanguageSelect = (code) => {
        setLanguage(code);
        setIsLangModalOpen(false);
    };

    const stepTitles = isEditing
        ? [
            t('Change Date', 'تغيير التاريخ'),
            t('Change Time', 'تغيير الوقت'),
            t('Change Table', 'تغيير الطاولة'),
            t('Update Details', 'تحديث البيانات'),
            t('Updated!', 'تم التحديث!'),
        ]
        : [
            t('Choose a Date', 'اختر تاريخاً'),
            t('Pick a Time', 'اختر وقتاً'),
            t('Select Your Table', 'اختر طاولتك'),
            t('Your Details', 'بياناتك'),
            t('Confirmed!', 'تم التأكيد!'),
        ];

    const totalVisibleSteps = 4; // Date, Time, Map, Form (Confirm is separate)

    const handleDateConfirm = (date) => {
        setSelectedDate(date);
        setSelectedTime(null);
        setStep(STEPS.TIME);
    };

    const handleTimeConfirm = (time) => {
        setSelectedTime(time);
        setStep(STEPS.MAP);
    };

    const handleTableSelect = (table) => {
        setSelectedTable(table);
        setStep(STEPS.FORM);
    };

    const handleReservationComplete = (res) => {
        // Clean up editing state
        if (isEditing) {
            sessionStorage.removeItem('editing_reservation');
        }
        setReservation(res);
        setStep(STEPS.CONFIRM);
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        } else if (isEditing) {
            // Cancel editing — go back to my reservations
            sessionStorage.removeItem('editing_reservation');
            router.push('/my-reservations');
        } else {
            router.push('/');
        }
    };

    const handleCancelEdit = () => {
        sessionStorage.removeItem('editing_reservation');
        router.push('/my-reservations');
    };

    const BackIcon = isRTL ? ChevronRight : ChevronLeft;

    return (
        <div className={`${styles.container} reservation-container`} style={{ height: '100%', overflow: 'hidden' }}>
            {/* Fixed Top Section */}
            {step < STEPS.CONFIRM && (
                <div className={styles.topBar}>
                    <div className={styles.topBarInner}>
                        {/* Back Button */}
                        <button className={styles.backButton} onClick={handleBack}>
                            <BackIcon size={20} />
                        </button>

                        {/* Progress Dots */}
                        <div className={styles.progressBar}>
                            {Array.from({ length: totalVisibleSteps }).map((_, i) => (
                                <div key={i} className={`${styles.progressStep} ${i <= step ? styles.active : ''}`}>
                                    <div className={styles.progressDot}>{i + 1}</div>
                                    {i < totalVisibleSteps - 1 && <div className={styles.progressLine} />}
                                </div>
                            ))}
                        </div>

                        {/* Language Button */}
                        <button
                            className={styles.langButton}
                            onClick={() => setIsLangModalOpen(true)}
                        >
                            <Globe size={18} />
                            <span>{language.toUpperCase()}</span>
                        </button>
                    </div>

                    <AnimatePresence>
                        {isLangModalOpen && (
                            <div className={styles.modalOverlay} onClick={() => setIsLangModalOpen(false)}>
                                <motion.div
                                    className={styles.modalContent}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className={styles.modalHeader}>
                                        <h3>{t('Choose Language', 'اختر اللغة')}</h3>
                                        <button onClick={() => setIsLangModalOpen(false)} className={styles.closeButton}>
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className={styles.langList}>
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.code}
                                                className={`${styles.langOption} ${language === lang.code ? styles.activeLang : ''}`}
                                                onClick={() => handleLanguageSelect(lang.code)}
                                            >
                                                <div className={styles.langInfo}>
                                                    <span className={styles.langNative}>{lang.native}</span>
                                                    <span className={styles.langEnglish}>{lang.name}</span>
                                                </div>
                                                {language === lang.code && <Check size={18} className={styles.checkIcon} />}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Step Title */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            className={styles.titleContainer}
                            initial={{ y: -8, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 8, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h2 className={styles.stepTitle}>
                                {stepTitles[step]}
                            </h2>
                            {step === STEPS.TIME && selectedDate && (
                                <div className={styles.headerDateBadge}>
                                    {selectedDate.getDate()} {language === 'ar'
                                        ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][selectedDate.getMonth()]
                                        : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][selectedDate.getMonth()]
                                    } {selectedDate.getFullYear()}
                                </div>
                            )}

                            {/* Cancel Edit Button — shown during editing */}
                            {isEditing && (
                                <button className={styles.cancelEditBtn} onClick={handleCancelEdit}>
                                    <X size={14} />
                                    {t('Cancel Edit', 'إلغاء التعديل')}
                                </button>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            )}

            {/* Warning for Missing Data */}
            {(!layouts || layouts.length === 0 || !settings || !hours || hours.length === 0) && step < STEPS.CONFIRM && (
                <div style={{
                    margin: '20px',
                    padding: '20px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid var(--error)',
                    borderRadius: '12px',
                    color: 'var(--error)',
                    textAlign: 'center'
                }}>
                    <h3 style={{ marginBottom: '8px' }}>{t('Reservations Unavailable', 'الحجوزات غير متوفرة')}</h3>
                    <p style={{ fontSize: '14px', opacity: 0.8 }}>
                        {t('This restaurant has not yet configured its reservation settings or opening hours.', 'هذا المطعم لم يقم بإعداد إعدادات الحجز أو ساعات العمل بعد.')}
                    </p>
                </div>
            )}

            {/* Step Content */}
            <div className={styles.stepContent}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ x: 40, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -40, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            alignSelf: 'stretch',
                        }}
                    >
                        {step === STEPS.DATE && (
                            <>
                                <DatePicker
                                    settings={settings}
                                    hours={hours}
                                    closures={closures}
                                    onConfirm={handleDateConfirm}
                                    initialDate={selectedDate}
                                />
                                {isEditing && selectedDate && (
                                    <button
                                        className={styles.keepStepBtn}
                                        onClick={() => setStep(STEPS.TIME)}
                                    >
                                        <Check size={18} />
                                        {t('Keep this Date & Continue', 'البقاء على هذا التاريخ والمتابعة')}
                                    </button>
                                )}
                            </>
                        )}
                        {step === STEPS.TIME && (
                            <>
                                <TimePicker
                                    selectedDate={selectedDate}
                                    settings={settings}
                                    hours={hours}
                                    onConfirm={handleTimeConfirm}
                                    initialTime={selectedTime}
                                />
                                {isEditing && selectedTime && (
                                    <button
                                        className={styles.keepStepBtn}
                                        onClick={() => setStep(STEPS.MAP)}
                                    >
                                        <Check size={18} />
                                        {t(`Keep ${selectedTime} & Continue`, `البقاء على الساعة ${selectedTime} والمتابعة`)}
                                    </button>
                                )}
                            </>
                        )}
                        {step === STEPS.MAP && (
                            <>
                                <RestaurantMap
                                    layouts={layouts}
                                    selectedDate={selectedDate}
                                    selectedTime={selectedTime}
                                    settings={settings}
                                    selectedTable={selectedTable}
                                    onTableSelect={handleTableSelect}
                                    editingResId={editId}
                                />
                                {isEditing && selectedTable && (
                                    <button
                                        className={styles.keepStepBtn}
                                        onClick={() => setStep(STEPS.FORM)}
                                    >
                                        <Check size={18} />
                                        {t(`Keep Table #${selectedTable.label} & Continue`, `البقاء على طاولة #${selectedTable.label} والمتابعة`)}
                                    </button>
                                )}
                            </>
                        )}
                        {step === STEPS.FORM && (
                            <ReservationForm
                                table={selectedTable}
                                date={selectedDate}
                                time={selectedTime}
                                settings={settings}
                                onComplete={handleReservationComplete}
                                editingReservation={isEditing ? editingReservation : null}
                            />
                        )}
                        {step === STEPS.CONFIRM && (
                            <Confirmation
                                reservation={reservation}
                                isEditing={isEditing}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
