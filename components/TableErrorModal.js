'use client';

import React from 'react';
import { useUI } from '@/context/UIContext';
import { useLanguage } from '@/context/LanguageContext';
import { QrCode, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TableErrorModal() {
    const { tableError } = useUI();
    const { t } = useLanguage();

    if (!tableError) return null;

    return (
        <AnimatePresence>
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        padding: '40px 30px',
                        width: '100%',
                        maxWidth: '380px',
                        textAlign: 'center',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    <div style={{ color: '#ef4444', marginBottom: '20px' }}>
                        <XCircle size={64} style={{ margin: '0 auto' }} />
                    </div>

                    <h2 style={{
                        color: '#1a1a1a',
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        marginBottom: '12px'
                    }}>
                        {t('Table Not Found', 'الطاولة غير موجودة')}
                    </h2>

                    <p style={{
                        color: '#666',
                        fontSize: '0.95rem',
                        lineHeight: 1.6,
                        marginBottom: '30px'
                    }}>
                        {t(
                            'The table number or code you are using is invalid. Please rescan the QR code on your table to continue.',
                            'رقم أو رمز الطاولة الذي تستخدمه غير صالح. يرجى إعادة مسح رمز الـ QR الموجود على طاولتك للمتابعة.'
                        )}
                    </p>

                    <div style={{
                        backgroundColor: '#f8fafc',
                        border: '1px dashed #cbd5e1',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        color: '#64748b'
                    }}>
                        <QrCode size={32} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                            {t('Please rescan QR code', 'يرجى إعادة مسح الرمز')}
                        </span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
