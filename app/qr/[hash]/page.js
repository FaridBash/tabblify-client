'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { useUI } from '@/context/UIContext';

export default function QRRedirectPage() {
    const router = useRouter();
    const params = useParams();
    const [invalidQR, setInvalidQR] = useState(false);
    const { organization } = useUI();

    useEffect(() => {
        const hash = params?.hash;
        if (!hash) {
            router.replace('/');
            return;
        }

        // Wait for organization to be available from context
        if (!organization) return;

        const basePath = organization.slug ? `/${organization.slug}` : '';

        const processQRScan = async () => {
            try {
                // 1. Fetch table details based on the hash and organization
                const { data: tableData, error: tableError } = await supabase
                    .from('tables')
                    .select('id, table_number')
                    .eq('table_hash', hash)
                    .eq('organization_id', organization.id)
                    .single();

                if (tableError || !tableData) {
                    console.error('Invalid Table QR Hash for this organization:', tableError);
                    setInvalidQR(true);
                    setTimeout(() => router.replace(basePath || '/'), 3000);
                    return;
                }

                // 2. Clear old session in local storage completely to ensure clean scan
                localStorage.setItem('restaurant_table_info', JSON.stringify({
                    table_number: tableData.table_number,
                    table_hash: hash,
                    id: tableData.id,
                    organization_id: organization.id
                }));

                // 3. Fallback tracking ID for analytics if not logged in
                let deviceId = localStorage.getItem('device_tracker_id');
                if (!deviceId) {
                    try {
                        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
                            deviceId = crypto.randomUUID();
                        } else {
                            throw new Error('crypto.randomUUID not available');
                        }
                    } catch (e) {
                        deviceId = `device-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
                    }
                    localStorage.setItem('device_tracker_id', deviceId);
                }

                // Fetch User ID if user is authenticated (otherwise null)
                const { data: { session } } = await supabase.auth.getSession();
                const userId = session?.user?.id || null;

                // 4. Log the scan directly in the Supabase 'qr_scans' table
                const { error: insertError } = await supabase.from('qr_scans').insert([
                    {
                        organization_id: organization.id,
                        table_id: tableData.id,
                        table_number: tableData.table_number.toString(),
                        table_hash: hash,
                        user_id: userId,
                        device_id: deviceId
                    }
                ]);

                if (insertError) {
                    console.warn('Scan logged with error:', insertError);
                }

                // Quick redirect
                router.replace(`${basePath}/t/${hash}`);

            } catch (err) {
                console.error('QR Scan Processing Error:', err);
                router.replace(`${basePath}/t/${hash}`);
            }
        };

        const timeoutId = setTimeout(() => {
            processQRScan();
        }, 100);

        return () => clearTimeout(timeoutId);

    }, [params, router, organization]);

    if (invalidQR) {
        return (
            <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--background)' }}>
                <p style={{ color: 'var(--error)', fontSize: '1.2rem', fontWeight: 'bold' }}>Invalid QR Code. Redirecting...</p>
            </div>
        );
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'var(--background)' }}>
            <Loader2 className="animate-spin" size={48} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--primary)', marginTop: '20px', fontWeight: '600' }}>Loading Table...</p>
        </div>
    );
}
