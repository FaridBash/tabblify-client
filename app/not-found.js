'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, AlertCircle, MoveLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function NotFound() {
    const { t } = useLanguage();

    return (
        <div style={{
            height: '100dvh',
            width: '100vw',
            position: 'fixed',
            top: 0,
            left: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            textAlign: 'center',
            background: 'var(--secondary)',
            color: 'var(--foreground)',
            zIndex: 999999,
        }}>
            {/* Background Image fix for 404 */}
            <div 
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url('/tabblify_landing_bg.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.15,
                    zIndex: -1
                }}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <div style={{
                    position: 'relative',
                    marginBottom: '32px'
                }}>
                    <AlertCircle size={100} color="var(--primary)" style={{ opacity: 0.4 }} />
                    <h1 style={{ 
                        position: 'absolute',
                        top: '55%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '3rem',
                        fontWeight: '900',
                        margin: 0,
                        color: 'var(--primary-glow)',
                        letterSpacing: '-2px'
                    }}>404</h1>
                </div>
            </motion.div>

            <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ fontSize: '1.8rem', marginBottom: '16px', fontWeight: '700' }}
            >
                {t('Venue Not Found', 'المكان غير موجود')}
            </motion.h2>

            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{ 
                    fontSize: '1.1rem', 
                    opacity: 0.6, 
                    maxWidth: '450px', 
                    marginBottom: '48px',
                    lineHeight: '1.6'
                }}
            >
                {t(
                    "The link you followed might be broken, or the organization is no longer active on Tabblify.",
                    "قد يكون الرابط الذي اتبعته معطلاً، أو لم تعد المؤسسة نشطة على تابليفاي."
                )}
            </motion.p>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <a 
                    href="/"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px 32px',
                        background: 'linear-gradient(135deg, var(--primary-glow) 0%, var(--primary) 100%)',
                        color: 'var(--secondary)',
                        borderRadius: '100px',
                        textDecoration: 'none',
                        fontWeight: '800',
                        fontSize: '1rem',
                        boxShadow: '0 20px 40px rgba(var(--primary-rgb), 0.25)',
                        transition: 'transform 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <MoveLeft size={20} />
                    {t('Back to Landing Page', 'العودة للصفحة الرئيسية')}
                </a>
            </motion.div>
        </div>
    );
}
