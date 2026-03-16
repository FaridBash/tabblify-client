'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function Loading() {
    const searchParams = useSearchParams();
    const type = searchParams.get('type');

    if (type === 'pdf') return null;

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
