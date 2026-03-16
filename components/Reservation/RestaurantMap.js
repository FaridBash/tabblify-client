'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { Plus, Minus, Info, X, Filter } from 'lucide-react';
import styles from './RestaurantMap.module.css';
import dynamic from 'next/dynamic';

// Dynamically import the KonvaMap component to avoid SSR issues
const KonvaMap = dynamic(() => import('./KonvaMap'), {
    ssr: false,
    loading: () => <div className={styles.loading}>Initializing Floor Map...</div>
});

export default function RestaurantMap({ layouts, selectedDate, selectedTime, settings, selectedTable, onTableSelect, editingResId }) {
    const { t, language } = useLanguage();
    const [currentLayoutIndex, setCurrentLayoutIndex] = useState(0);
    const layout = useMemo(() => layouts?.[currentLayoutIndex], [layouts, currentLayoutIndex]);
    const [activeTableIds, setActiveTableIds] = useState(null);
    const [reservedTableIds, setReservedTableIds] = useState(new Set());
    const [blockedTableIds, setBlockedTableIds] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [zoom, setZoom] = useState(0.8);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [showLegendModal, setShowLegendModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [availableFeatures, setAvailableFeatures] = useState([]);
    const [selectedFeatures, setSelectedFeatures] = useState(new Set());
    const [filteredTableIds, setFilteredTableIds] = useState(null);
    const [tempSelectedTable, setTempSelectedTable] = useState(null);
    const [nextResInfo, setNextResInfo] = useState(null);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const containerRef = useRef(null);

    // Auto-select floor when table is pre-selected (e.g. editing)
    useEffect(() => {
        if (selectedTable && layouts) {
            const floorIdx = layouts.findIndex(l => {
                const items = l.items || l.layout?.items || l.grid_data?.items || [];
                return items.find(item => (item.tableId || item.table_id) === selectedTable.id);
            });
            if (floorIdx !== -1 && floorIdx !== currentLayoutIndex) {
                setCurrentLayoutIndex(floorIdx);
            }
        }
    }, [selectedTable, layouts]);

    // Fetch active tables and features
    useEffect(() => {
        const initData = async () => {
            // Fetch active tables
            const { data: tables } = await supabase
                .from('tables')
                .select('id')
                .eq('is_active', true);

            if (tables) {
                setActiveTableIds(new Set(tables.map(t => t.id)));
            }

            // Fetch available features
            const { data: features } = await supabase
                .from('table_features_list')
                .select('*')
                .order('name_en');

            if (features) {
                setAvailableFeatures(features);
            }
        };
        initData();
    }, []);

    // Filter effect
    useEffect(() => {
        if (selectedFeatures.size === 0) {
            setFilteredTableIds(null);
            return;
        }

        const fetchFilteredTables = async () => {
            const { data } = await supabase
                .from('table_feature_assignments')
                .select('table_id')
                .in('feature_id', Array.from(selectedFeatures));

            if (data) {
                // If multiple features selected, we might want intersection (AND) or union (OR)
                // For now, let's do union (OR) - showing tables that have AT LEAST ONE of the selected features
                setFilteredTableIds(new Set(data.map(t => t.table_id)));
            }
        };
        fetchFilteredTables();
    }, [selectedFeatures]);

    const toggleFeature = (id) => {
        const next = new Set(selectedFeatures);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedFeatures(next);
    };

    // Extract raw items from layout
    const rawItems = useMemo(() => {
        if (!layout) return [];
        let extracted = [];
        if (Array.isArray(layout.items)) extracted = layout.items;
        else if (layout.layout && Array.isArray(layout.layout.items)) extracted = layout.layout.items;
        else if (layout.grid_data && Array.isArray(layout.grid_data.items)) extracted = layout.grid_data.items;
        else if (Array.isArray(layout)) extracted = layout;
        return extracted;
    }, [layout]);

    // Filter items to only show active tables
    const items = useMemo(() => {
        if (!activeTableIds) return rawItems;
        return rawItems.filter(item => {
            if (item.type === 'table') {
                const tid = item.tableId || item.table_id;
                return tid && activeTableIds.has(tid);
            }
            return true;
        });
    }, [rawItems, activeTableIds]);
    const bufferTime = settings?.buffer_time || 30;

    // Rich colors matching the provided sketch
    const COLORS = {
        available: '#EAE3D2', // Light cream/beige (Table color)
        availableStroke: '#C2B8A3',
        reserved: '#ef4444',
        reservedStroke: '#991b1b',
        blocked: '#4b5563',
        blockedStroke: '#1f2937',
        text: '#1A2238', // Dark text for light tables
        furniture: '#333533', // Dark charcoal/slate
        wall: '#D4A373', // Light wood/tan
        window: '#bae6fd',
        plant: '#558B2F', // Natural Green
        floor: '#1A2238', // Dark navy floor from image
        tile: '#1A2238'
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

    const [dayReservations, setDayReservations] = useState([]);
    const [dayBlocks, setDayBlocks] = useState([]);

    // Fetch availability
    useEffect(() => {
        if (!selectedDate || !selectedTime) return;

        const fetchData = async () => {
            setLoading(true);
            const dateStr = selectedDate.toISOString().split('T')[0];
            const [h, m] = selectedTime.split(':').map(Number);
            const startMin = h * 60 + m;
            const endMin = startMin + bufferTime;
            const endTimeStr = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;

            try {
                // Fetch all reservations for the day to check availability AND "next reservation"
                const { data: reservations } = await supabase
                    .from('reservations')
                    .select('*')
                    .eq('reservation_date', dateStr)
                    .in('status', ['pending', 'confirmed']);

                setDayReservations(reservations || []);

                // Filter for current conflicts
                const conflicts = (reservations || []).filter(r => {
                    if (editingResId && r.id === editingResId) return false;
                    return r.start_time <= endTimeStr && r.end_time >= selectedTime;
                });
                setReservedTableIds(new Set(conflicts.map(r => r.table_id)));

                // Fetch all blocks for the day
                const { data: blocks } = await supabase
                    .from('table_blocks')
                    .select('*')
                    .eq('block_date', dateStr);

                setDayBlocks(blocks || []);

                // Filter for current conflicts
                const blockConflicts = (blocks || []).filter(b => {
                    return b.start_time <= endTimeStr && b.end_time >= selectedTime;
                });
                setBlockedTableIds(new Set(blockConflicts.map(b => b.table_id)));

            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedDate, selectedTime, bufferTime]);

    const isTableAvailable = (tableId) => {
        return !reservedTableIds.has(tableId) && !blockedTableIds.has(tableId);
    };

    const handleTableClick = (table) => {
        // Calculate next reservation for this table
        const nextRes = [...dayReservations, ...dayBlocks]
            .filter(r => (r.table_id === table.id || (r.table_id === null && r.area === table.area)) && r.start_time > selectedTime)
            .sort((a, b) => a.start_time.localeCompare(b.start_time))[0];

        let maxHours = 4; // Default max stay if no next reservation
        if (nextRes) {
            const [h1, m1] = selectedTime.split(':').map(Number);
            const [h2, m2] = nextRes.start_time.split(':').map(Number);
            const diffMin = (h2 * 60 + m2) - (h1 * 60 + m1);
            maxHours = Math.floor(diffMin / 6) / 10; // Precision to 0.1 hours
            setNextResInfo({
                time: nextRes.start_time.slice(0, 5),
                maxDuration: maxHours
            });
        } else {
            setNextResInfo(null);
        }

        setTempSelectedTable(table);
        setShowInfoModal(true);
    };

    const handleConfirmSelection = () => {
        onTableSelect({ ...tempSelectedTable, maxDuration: nextResInfo?.maxDuration || 4 });
        setShowInfoModal(false);
    };

    const handleZoom = (delta) => {
        setZoom(prev => Math.min(Math.max(0.3, prev + delta), 2.5));
    };



    return (
        <div className={styles.wrapper}>
            {/* Legend */}
            <div className={styles.legend}>
                <div className={styles.legendLeft}>
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

                <div className={styles.legendButtons}>
                    <button
                        className={`${styles.infoTrigger} ${selectedFeatures.size > 0 ? styles.filterActive : ''}`}
                        onClick={() => setShowFilterModal(true)}
                        title={t('Filter', 'تصفية')}
                    >
                        <Filter size={18} />
                    </button>
                    <button
                        className={styles.infoTrigger}
                        onClick={() => setShowLegendModal(true)}
                        title={t('Map Key', 'مفتاح الخريطة')}
                    >
                        <Info size={20} />
                    </button>
                </div>
            </div>

            {/* Floor Selector - Only show if more than 1 layout */}
            {layouts && layouts.length > 1 && (
                <div className={styles.floorSelector}>
                    {layouts.map((l, idx) => (
                        <button
                            key={l.id}
                            className={`${styles.floorBtn} ${currentLayoutIndex === idx ? styles.activeFloor : ''}`}
                            onClick={() => setCurrentLayoutIndex(idx)}
                        >
                            {t(l.name, l.name_ar || l.name)}
                        </button>
                    ))}
                </div>
            )}

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
                        onTableSelect={handleTableClick}
                        isTableAvailable={isTableAvailable}
                        reservedTableIds={reservedTableIds}
                        blockedTableIds={blockedTableIds}
                        selectedTable={selectedTable}
                        isFiltering={filteredTableIds !== null}
                        filteredTableIds={filteredTableIds}
                    />
                )}

                <div className={styles.mapInsetFooter}>
                    {/* Zoom Controls */}
                    <div className={styles.zoomControls}>
                        <button onClick={() => handleZoom(0.1)} className={styles.zoomBtn} title="Zoom In">
                            <Plus size={18} />
                        </button>
                        <button onClick={() => setZoom(0.8)} className={styles.zoomBtn} title="Reset Zoom">
                            <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>{Math.round(zoom * 100)}%</span>
                        </button>
                        <button onClick={() => handleZoom(-0.1)} className={styles.zoomBtn} title="Zoom Out">
                            <Minus size={18} />
                        </button>
                    </div>

                    <p className={styles.instruction}>
                        {t('Tap on an available table to select it', 'اضغط على طاولة متاحة لاختيارها')}
                    </p>
                </div>
            </div>

            {/* Table Info Modal */}
            {showInfoModal && tempSelectedTable && (
                <div className={styles.modalOverlay} onClick={() => setShowInfoModal(false)}>
                    <div className={styles.infoModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{t('Table Details', 'تفاصيل الطاولة')}</h3>
                            <div className={styles.tableBadge}>{tempSelectedTable.capacity} {t('Persons', 'أشخاص')}</div>
                        </div>

                        <div className={styles.modalBody}>
                            {nextResInfo ? (
                                <div className={styles.nextResBox}>
                                    <p className={styles.resLabel}>{t('Next Reservation:', 'الحجز التالي:')}</p>
                                    <p className={styles.resTime}>{nextResInfo.time}</p>
                                    <div className={styles.limitWarning}>
                                        {t('Available for max', 'متاحة لمدة أقصاها')} <strong>{nextResInfo.maxDuration} {t('hours', 'ساعات')}</strong>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.nextResBox}>
                                    <p className={styles.resLabel}>{t('Availability:', 'التوفر:')}</p>
                                    <p className={styles.resStatus}>{t('Available for the rest of the day', 'متاحة لبقية اليوم')}</p>
                                    <div className={styles.limitWarning}>
                                        {t('Max stay duration:', 'مدة الإقامة القصوى:')} <strong>4 {t('hours', 'ساعات')}</strong>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => setShowInfoModal(false)}>
                                {t('Cancel', 'إلغاء')}
                            </button>
                            <button className={styles.confirmBtn} onClick={handleConfirmSelection}>
                                {t('Confirm Table', 'تأكيد الطاولة')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Map Legend Modal */}
            {showLegendModal && (
                <div className={styles.modalOverlay} onClick={() => setShowLegendModal(false)}>
                    <div className={styles.legendModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{t('Map Legend', 'مفتاح الخريطة')}</h3>
                            <button className={styles.modalClose} onClick={() => setShowLegendModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.legendSection}>
                                <div className={styles.sectionTitle}>{t('Table Status', 'حالة الطاولة')}</div>
                                <div className={styles.statusGrid}>
                                    <div className={styles.statusItem}>
                                        <div className={styles.statusDot} style={{ background: COLORS.available }} />
                                        <span>{t('Available', 'متاحة')}</span>
                                    </div>
                                    <div className={styles.statusItem}>
                                        <div className={styles.statusDot} style={{ background: COLORS.reserved }} />
                                        <span>{t('Reserved', 'محجوزة')}</span>
                                    </div>
                                    <div className={styles.statusItem}>
                                        <div className={styles.statusDot} style={{ background: COLORS.blocked }} />
                                        <span>{t('Blocked', 'محظورة')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.legendSection}>
                                <div className={styles.sectionTitle}>{t('Areas & Icons', 'المناطق والأيقونات')}</div>
                                <div className={styles.legendGrid}>
                                    <div className={styles.areaItem}>
                                        <div className={styles.iconCircle}>
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                <path d="M17,11c0.552,0,1-0.448,1-1c0-2.206-1.794-4-4-4c-1.371,0-2.581,0.697-3.297,1.751C10.155,7.28,9.155,7,8,7 C5.794,7,4,8.794,4,11c0,0.552,0.448,1,1,1v5c0,0.552,0.448,1,1,1h10c0.552,0,1-0.448,1-1v-5H17z M14,16H8v-2h6V16z" />
                                            </svg>
                                        </div>
                                        <span>{t('Kitchen', 'المطبخ')}</span>
                                    </div>
                                    <div className={styles.areaItem}>
                                        <div className={styles.iconCircle}>
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                <path d="M5 21h14a2 2 0 0 0 2-2V7l-4.5 9-4.5-9-4.5 9L3 7v12a2 2 0 0 0 2 2Z" />
                                            </svg>
                                        </div>
                                        <span>{t('VIP Area', 'منطقة VIP')}</span>
                                    </div>
                                    <div className={styles.areaItem}>
                                        <div className={styles.iconCircle}>
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zm-11 11h7v7H3v-7zm11 0h7v7h-7v-7z" />
                                            </svg>
                                        </div>
                                        <span>{t('Main Area', 'المنطقة الرئيسية')}</span>
                                    </div>
                                    <div className={styles.areaItem}>
                                        <div className={styles.iconCircle}>
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                <path d="M14.17,9.17L12,7L9.83,9.17C8.67,10.33,8,11.89,8,13.54c0,3.31,2.69,6,6,6s6-2.69,6-6C20,11.89,19.33,10.33,18.17,9.17z M14,17.5c-2.21,0-4-1.79-4-4c0-1.1,0.45-2.1,1.17-2.83l2.83,2.83l2.83-2.83c0.72,0.72,1.17,1.72,1.17,2.83C18,15.71,16.21,17.5,14,17.5z M7,11V3h2v8H7z M3,11V3h2v8H3z" />
                                            </svg>
                                        </div>
                                        <span>{t('Patio', 'التراس')}</span>
                                    </div>
                                    <div className={styles.areaItem}>
                                        <div className={styles.iconCircle}>
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                <path d="M18,16H2V13H18V16M19,16H22V13H19V16M11,11C11,11 13,10 13,8C13,6 11,5 11,5M7,11C7,11 9,10 9,8C9,6 7,5 7,5" />
                                            </svg>
                                        </div>
                                        <span>{t('Smoking Area', 'منطقة التدخين')}</span>
                                    </div>
                                    <div className={styles.areaItem}>
                                        <div className={styles.iconCircle} style={{ position: 'relative' }}>
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                <path d="M18,16H2V13H18V16M19,16H22V13H19V16M11,11C11,11 13,10 13,8C13,6 11,5 11,5M7,11C7,11 9,10 9,8C9,6 7,5 7,5" />
                                            </svg>
                                            <div style={{ position: 'absolute', top: '50%', left: '50%', width: '100%', height: '2px', background: '#ef4444', transform: 'translate(-50%, -50%) rotate(-45deg)', borderRadius: '1px' }} />
                                        </div>
                                        <span>{t('No Smoking', 'ممنوع التدخين')}</span>
                                    </div>
                                    <div className={styles.areaItem}>
                                        <div className={styles.iconCircle}>
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm2 19v-6h4l-4-6H8l-4 6h4v6h4z" />
                                            </svg>
                                        </div>
                                        <span>{t('Restrooms', 'الحمامات')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Filter Modal */}
            {showFilterModal && (
                <div className={styles.modalOverlay} onClick={() => setShowFilterModal(false)}>
                    <div className={styles.legendModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div className={styles.headerTop}>
                                <h3>{t('Filter by Features', 'تصفية حسب المميزات')}</h3>
                                <button className={styles.modalClose} onClick={() => setShowFilterModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <p className={styles.modalSub}>{t('Highlight tables with specific features', 'إظهار الطاولات التي تحتوي على مميزات معينة')}</p>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.featuresGrid}>
                                {availableFeatures.map(feature => (
                                    <button
                                        key={feature.id}
                                        className={`${styles.featureTag} ${selectedFeatures.has(feature.id) ? styles.activeFeature : ''}`}
                                        onClick={() => toggleFeature(feature.id)}
                                    >
                                        {t(feature.name_en, feature.name_ar)}
                                    </button>
                                ))}
                            </div>
                            {selectedFeatures.size > 0 && (
                                <button
                                    className={styles.resetBtn}
                                    onClick={() => setSelectedFeatures(new Set())}
                                >
                                    {t('Reset Filter', 'إعادة ضبط')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
