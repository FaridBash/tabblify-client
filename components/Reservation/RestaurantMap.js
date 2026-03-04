'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { Plus, Minus } from 'lucide-react';
import styles from './RestaurantMap.module.css';
import dynamic from 'next/dynamic';

// Dynamically import the KonvaMap component to avoid SSR issues
const KonvaMap = dynamic(() => import('./KonvaMap'), {
    ssr: false,
    loading: () => <div className={styles.loading}>Initializing Floor Map...</div>
});

export default function RestaurantMap({ layout, selectedDate, selectedTime, settings, selectedTable, onTableSelect }) {
    const { t, language } = useLanguage();
    const [reservedTableIds, setReservedTableIds] = useState(new Set());
    const [blockedTableIds, setBlockedTableIds] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [zoom, setZoom] = useState(0.6); // Start slightly zoomed out
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const containerRef = useRef(null);

    // Extract items from different possible data structures in the DB
    const items = useMemo(() => {
        if (!layout) return [];
        // If layout itself has items (passed directly or simplified)
        if (Array.isArray(layout.items)) return layout.items;
        // If layout is the DB record and contains a 'layout' JSON field (common)
        if (layout.layout && Array.isArray(layout.layout.items)) return layout.layout.items;
        // If it's the old 'grid_data' but converted to new structure
        if (layout.grid_data && Array.isArray(layout.grid_data.items)) return layout.grid_data.items;
        // Fallback for direct array if layout itself is the items array
        if (Array.isArray(layout)) return layout;
        return [];
    }, [layout]);
    const bufferTime = settings?.buffer_time || 30;

    // Rich colors matching the provided sketch
    const COLORS = {
        available: '#d97706', // Brownish Orange (Table color)
        availableStroke: '#92400e',
        reserved: '#ef4444',
        reservedStroke: '#991b1b',
        blocked: '#4b5563',
        blockedStroke: '#1f2937',
        text: '#ffffff',
        furniture: '#1e293b', // Dark Slate for chairs/sofas
        wall: '#0f172a',
        window: '#bae6fd',
        plant: '#4ade80',
        floor: '#78350f', // Dark wood floor
        tile: '#fef3c7'   // Light tile floor
    };

    // Calculate map bounds to auto-set stage size or scrolling
    const mapBounds = useMemo(() => {
        if (items.length === 0) return { width: 1000, height: 800 };
        let maxX = 0, maxY = 0;
        items.forEach(item => {
            const right = (item.x || 0) + (item.width || 100);
            const bottom = (item.y || 0) + (item.height || 100);
            if (right > maxX) maxX = right;
            if (bottom > maxY) maxY = bottom;
        });
        return { width: maxX + 100, height: maxY + 100 };
    }, [items]);

    // Update dimensions on resize using ResizeObserver
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    setDimensions({ width, height });
                }
            }
        });

        observer.observe(containerRef.current);

        // Initial measurement
        const initial = containerRef.current.getBoundingClientRect();
        if (initial.width > 0) {
            setDimensions({ width: initial.width, height: initial.height });
        } else {
            // Fallback for initial render if rect is 0
            setDimensions({ width: window.innerWidth - 40, height: 400 });
        }

        return () => observer.disconnect();
    }, []);

    // Fetch availability
    useEffect(() => {
        if (!selectedDate || !selectedTime) return;

        const fetchAvailability = async () => {
            setLoading(true);
            const dateStr = selectedDate.toISOString().split('T')[0];
            const [h, m] = selectedTime.split(':').map(Number);
            const startMin = h * 60 + m;
            const endMin = startMin + bufferTime;
            const endTimeStr = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;

            try {
                const { data: reservations } = await supabase
                    .from('reservations')
                    .select('table_id')
                    .eq('reservation_date', dateStr)
                    .in('status', ['pending', 'confirmed'])
                    .lte('start_time', endTimeStr)
                    .gte('end_time', selectedTime);

                setReservedTableIds(new Set((reservations || []).map(r => r.table_id)));

                const { data: blocks } = await supabase
                    .from('table_blocks')
                    .select('table_id')
                    .eq('block_date', dateStr)
                    .lte('start_time', endTimeStr)
                    .gte('end_time', selectedTime);

                setBlockedTableIds(new Set((blocks || []).map(b => b.table_id)));
            } catch (err) {
                console.error('Error fetching availability:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAvailability();
    }, [selectedDate, selectedTime, bufferTime]);

    const isTableAvailable = (tableId) => {
        return !reservedTableIds.has(tableId) && !blockedTableIds.has(tableId);
    };

    const handleZoom = (delta) => {
        setZoom(prev => Math.min(Math.max(0.3, prev + delta), 2.5));
    };



    return (
        <div className={styles.wrapper}>
            {/* Legend */}
            <div className={styles.legend}>
                <div className={styles.legendItem}>
                    <div className={styles.legendDot} style={{ background: COLORS.available, border: `1px solid ${COLORS.availableStroke}` }} />
                    {t('Available', 'متاحة')}
                </div>
                <div className={styles.legendItem}>
                    <div className={styles.legendDot} style={{ background: COLORS.reserved, border: `1px solid ${COLORS.reservedStroke}` }} />
                    {t('Reserved', 'محجوزة')}
                </div>
                <div className={styles.legendItem}>
                    <div className={styles.legendDot} style={{ background: COLORS.blocked, border: `1px solid ${COLORS.blockedStroke}` }} />
                    {t('Blocked', 'محظورة')}
                </div>
            </div>

            <div
                className={styles.mapContainer}
                ref={containerRef}
            >
                {loading ? (
                    <div className={styles.loading}>{t('Loading availability...', 'جاري التحقق من التوفر...')}</div>
                ) : items.length === 0 ? (
                    <div className={styles.loading}>{t('No map layout found', 'لا يوجد تصميم للخريطة')}</div>
                ) : dimensions.width > 0 && (
                    <KonvaMap
                        items={items}
                        dimensions={dimensions}
                        zoom={zoom}
                        COLORS={COLORS}
                        onTableSelect={onTableSelect}
                        isTableAvailable={isTableAvailable}
                        reservedTableIds={reservedTableIds}
                        blockedTableIds={blockedTableIds}
                        selectedTable={selectedTable}
                    />
                )}

                {/* Zoom Controls */}
                <div className={styles.zoomControls}>
                    <button onClick={() => handleZoom(0.1)} className={styles.zoomBtn}>
                        <Plus size={18} />
                    </button>
                    <button onClick={() => setZoom(0.8)} className={styles.zoomBtn}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>{Math.round(zoom * 100)}%</span>
                    </button>
                    <button onClick={() => handleZoom(-0.1)} className={styles.zoomBtn}>
                        <Minus size={18} />
                    </button>
                </div>
            </div>

            <p className={styles.instruction}>
                {t('Tap on an available table to select it', 'اضغط على طاولة متاحة لاختيارها')}
            </p>
        </div>
    );
}
