'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import { supabase } from '@/lib/supabase';

function TableParamsHandler() {
    const pathname = usePathname();
    const router = useRouter();
    const params = useParams();
    const { setTableNumber, setTableData, setTableError } = useUI();

    useEffect(() => {
        const fetchTableData = async (identifier) => {
            try {
                // Strictly fetch by hash to prevent manual number entry
                const { data, error } = await supabase
                    .from('tables')
                    .select('*')
                    .eq('table_hash', identifier)
                    .eq('is_active', true)
                    .single();

                if (data && !error) {
                    setTableNumber(data.table_number);
                    if (setTableData) setTableData(data);
                    setTableError(false);
                    localStorage.setItem('restaurant_table_info', JSON.stringify(data));
                } else {
                    setTableError(true);
                }
            } catch (err) {
                console.error('Error fetching table data:', err);
                setTableError(true);
            }
        };

        const urlTable = params?.tableId;
        const savedTableJson = localStorage.getItem('restaurant_table_info');

        // Skip table logic on landing page and public standalone pages
        const publicPaths = ['/', '/reserve'];
        const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/menus');
        if (isPublicPath) {
            setTableError(false);
            return;
        }

        if (urlTable) {
            // URL has it, fetch fresh data
            fetchTableData(urlTable);
        } else if (savedTableJson) {
            // URL doesn't have it, but storage does
            try {
                const savedTable = JSON.parse(savedTableJson);
                setTableNumber(savedTable.table_number);
                if (setTableData) setTableData(savedTable);

                // Append identifier to URL (Strictly hash)
                const identifier = savedTable.table_hash;
                if (identifier && !pathname.startsWith(`/t/${identifier}`)) {
                    // Redirect to the table directory if not already there
                    router.replace(`/t/${identifier}${pathname === '/' ? '' : pathname}`);
                }
            } catch (e) {
                localStorage.removeItem('restaurant_table_info');
                setTableError(true);
            }
        } else {
            // No URL param and no saved session - this is an unauthorized access attempt
            setTableError(true);
        }
    }, [pathname, params, router, setTableNumber, setTableData, setTableError]);

    return null;
}

export default function TableInitializer() {
    return (
        <Suspense fallback={null}>
            <TableParamsHandler />
        </Suspense>
    );
}
