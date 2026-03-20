'use client';

import React from 'react';
import { useUI } from '@/context/UIContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter, usePathname } from 'next/navigation';
import { QrCode, XCircle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TableErrorModal() {
    const { tableError, organization } = useUI();
    const { t } = useLanguage();
    const router = useRouter();
    const rawPathname = usePathname();

    const pathname = rawPathname;

    // Don't show on public routes that don't require a table session
    if (!tableError || pathname?.startsWith('/menus') || pathname?.startsWith('/my-reservations') || pathname === '/') return null;

    return (
        <AnimatePresence>
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(var(--black-rgb), 0.85)',
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
                        backgroundColor: 'var(--secondary-dark)',
                        borderRadius: '30px',
                        padding: '40px 30px',
                        width: '100%',
                        maxWidth: '400px',
                        textAlign: 'center',
                        border: '1px solid var(--primary-dim)',
                        boxShadow: '0 25px 50px -12px rgba(var(--black-rgb), 0.5)'
                    }}
                >
                    <div style={{ color: 'var(--error)', marginBottom: '20px' }}>
                        <XCircle size={64} style={{ margin: '0 auto' }} />
                    </div>

                    <h2 style={{
                        color: 'var(--primary-glow)',
                        fontSize: '1.8rem',
                        fontWeight: 900,
                        marginBottom: '15px',
                        fontFamily: 'var(--font-h1)'
                    }}>
                        {t('Invalid Table', 'طاولة غير صالحة')}
                    </h2>

                    <p style={{
                        color: 'var(--foreground)',
                        fontSize: '1rem',
                        lineHeight: 1.6,
                        marginBottom: '30px',
                        opacity: 0.9
                    }}>
                        {t(
                            'We couldn\'t find the table you\'re looking for. Please scan a valid QR code or return home.',
                            'لم نتمكن من العثور على الطاولة التي تبحث عنها. يرجى مسح رمز QR صالح أو العودة للرئيسية.'
                        )}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{
                            backgroundColor: 'rgba(var(--white-rgb), 0.05)',
                            border: '1px dashed var(--primary-dim)',
                            borderRadius: '20px',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px',
                            color: 'var(--primary-glow)'
                        }}>
                            <QrCode size={30} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                {t('Please rescan QR code', 'يرجى إعادة مسح الرمز')}
                            </span>
                        </div>

                        <button
                            onClick={() => {
                                window.location.href = '/';
                            }}
                            style={{
                                background: 'var(--primary)',
                                color: 'var(--secondary-dark)',
                                border: 'none',
                                padding: '16px',
                                borderRadius: '20px',
                                fontSize: '1.1rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}
                        >
                            <Calendar size={20} />
                            {t('Go to Home Screen', 'العودة إلى الصفحة الرئيسية')}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
