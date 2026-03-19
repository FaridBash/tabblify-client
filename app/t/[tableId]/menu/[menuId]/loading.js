'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Suspense } from 'react';

function LoadingContent() {
    const searchParams = useSearchParams();
    const { t } = useLanguage();
    const type = searchParams.get('type');

    if (type === 'pdf') {
        return (
            <div style={{ 
                height: '70dvh', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                width: '100%' 
            }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ color: 'var(--primary)', marginTop: '20px', fontWeight: '600' }}>
                    {t('Preparing Menu...', 'جاري تحضير القائمة...')}
                </p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', width: '100vw' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div 
                        key={i} 
                        className="skeleton" 
                        style={{ 
                            height: '140px', 
                            width: '100%', 
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '20px'
                        }} 
                    >
                        <div className="skeleton" style={{ width: '100px', height: '100px', borderRadius: '20px', flexShrink: 0, opacity: 0.2 }} />
                        <div style={{ marginLeft: '20px', flex: 1 }}>
                            <div className="skeleton" style={{ height: '30px', width: '60%', marginBottom: '10px', borderRadius: '8px', opacity: 0.2 }} />
                            <div className="skeleton" style={{ height: '20px', width: '80%', borderRadius: '4px', opacity: 0.1 }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Loading() {
    return (
        <Suspense fallback={null}>
            <LoadingContent />
        </Suspense>
    );
}
