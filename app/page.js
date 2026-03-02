'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootRedirect() {
    const router = useRouter();

    useEffect(() => {
        const savedTableJson = localStorage.getItem('restaurant_table_info');
        if (savedTableJson) {
            try {
                const savedTable = JSON.parse(savedTableJson);
                if (savedTable?.table_hash) {
                    router.replace(`/t/${savedTable.table_hash}`);
                    return;
                }
            } catch (e) {
                console.error('Error parsing saved table');
            }
        }
    }, [router]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--primary)', flexDirection: 'column', gap: '20px' }}>
            <h2>Welcome to Café De La Paix</h2>
            <p>Please scan the QR code on your table to view the menu.</p>
        </div>
    );
}
