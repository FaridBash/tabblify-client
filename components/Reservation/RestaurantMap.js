'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { Users, Cigarette, Lock, Plus, Minus, Maximize, ZoomIn, ZoomOut } from 'lucide-react';
import styles from './RestaurantMap.module.css';

const CELL_COLORS = {
    kitchen: '#3d3d3d', // Solid dark grey/charcoal for kitchen
    bar: '#2c1a4d', // Solid deep purple for bar
    toilet: '#2d3748', // Solid slate blue/grey for restrooms
    plant: '#1a4731', // Solid dark green for plants/decor
    walkway: 'transparent',
};

export default function RestaurantMap({ layout, selectedDate, selectedTime, settings, onTableSelect }) {
    const { t } = useLanguage();
    const [reservedTableIds, setReservedTableIds] = useState(new Set());
    const [blockedTableIds, setBlockedTableIds] = useState(new Set());
    const [hoveredTable, setHoveredTable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [zoom, setZoom] = useState(1);
    const mapRef = useRef(null);
    const scrollRef = useRef(null);

    const gridData = layout?.grid_data || [];
    const rowHeights = layout?.row_heights || [];
    const colWidths = layout?.col_widths || [];
    const bufferTime = settings?.buffer_time || 30;

    // Extract unique tables from grid
    const tablesInGrid = useMemo(() => {
        const map = new Map();
        gridData.forEach((row, ri) => {
            row.forEach((cell, ci) => {
                if (cell.type === 'table' && cell.tableId) {
                    if (!map.has(cell.tableId)) {
                        map.set(cell.tableId, {
                            tableId: cell.tableId,
                            label: cell.label,
                            shape: cell.shape,
                            capacity: cell.capacity,
                            cells: [],
                        });
                    }
                    map.get(cell.tableId).cells.push({ row: ri, col: ci });
                }
            });
        });
        return map;
    }, [gridData]);

    // Fetch reservations and blocks for the selected date/time
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
                // Fetch reservations that overlap with the selected time
                const { data: reservations } = await supabase
                    .from('reservations')
                    .select('table_id')
                    .eq('reservation_date', dateStr)
                    .in('status', ['pending', 'confirmed'])
                    .lte('start_time', endTimeStr)
                    .gte('end_time', selectedTime);

                const reserved = new Set((reservations || []).map(r => r.table_id));
                setReservedTableIds(reserved);

                // Fetch table blocks
                const { data: blocks } = await supabase
                    .from('table_blocks')
                    .select('table_id')
                    .eq('block_date', dateStr)
                    .lte('start_time', endTimeStr)
                    .gte('end_time', selectedTime);

                const blocked = new Set((blocks || []).map(b => b.table_id));
                setBlockedTableIds(blocked);
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

    const handleTableClick = (tableId) => {
        if (!isTableAvailable(tableId)) return;
        const tableInfo = tablesInGrid.get(tableId);
        if (tableInfo) {
            onTableSelect({
                id: tableId,
                label: tableInfo.label,
                capacity: tableInfo.capacity,
                shape: tableInfo.shape,
            });
        }
    };

    const handleZoom = (delta) => {
        setZoom(prev => Math.min(Math.max(0.5, prev + delta), 2.5));
    };

    const resetZoom = () => setZoom(1);

    // Support Ctrl + Wheel zooming
    useEffect(() => {
        const handleWheel = (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                handleZoom(delta);
            }
        };
        const el = mapRef.current;
        if (el) {
            el.addEventListener('wheel', handleWheel, { passive: false });
            return () => el.removeEventListener('wheel', handleWheel);
        }
    }, [mapRef]);

    // Determine if a cell belongs to a multi-cell table and if it's the "primary" cell
    const getTableCellInfo = (cell) => {
        if (cell.type !== 'table' || !cell.tableId) return null;
        const table = tablesInGrid.get(cell.tableId);
        if (!table) return null;
        return table;
    };

    const isPrimaryCell = (cell, ri, ci) => {
        if (cell.type !== 'table' || !cell.tableId) return false;
        const table = tablesInGrid.get(cell.tableId);
        if (!table) return false;
        return table.cells[0].row === ri && table.cells[0].col === ci;
    };

    // Calculate total grid dimensions
    const totalWidth = colWidths.reduce((a, b) => a + b, 0);
    const totalHeight = rowHeights.reduce((a, b) => a + b, 0);

    return (
        <div className={styles.wrapper}>
            {/* Legend */}
            <div className={styles.legend}>
                <div className={styles.legendItem}>
                    <div className={`${styles.legendDot} ${styles.availableDot}`} />
                    {t('Available', 'متاحة')}
                </div>
                <div className={styles.legendItem}>
                    <div className={`${styles.legendDot} ${styles.reservedDot}`} />
                    {t('Reserved', 'محجوزة')}
                </div>
                <div className={styles.legendItem}>
                    <div className={`${styles.legendDot} ${styles.blockedDot}`} />
                    {t('Blocked', 'محظورة')}
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>{t('Loading map...', 'جاري تحميل الخريطة...')}</div>
            ) : (
                <div className={styles.mapContainer} ref={mapRef}>
                    <div
                        className={styles.zoomWrapper}
                        style={{
                            width: `${totalWidth * zoom}px`,
                            height: `${totalHeight * zoom}px`,
                            transition: 'width 0.2s ease, height 0.2s ease'
                        }}
                    >
                        <div
                            className={styles.grid}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: colWidths.map(w => `${w}px`).join(' '),
                                gridTemplateRows: rowHeights.map(h => `${h}px`).join(' '),
                                width: `${totalWidth}px`,
                                height: `${totalHeight}px`,
                                transformOrigin: '0 0',
                                transform: `scale(${zoom})`,
                                transition: 'transform 0.2s ease'
                            }}
                        >
                            {gridData.map((row, ri) =>
                                row.map((cell, ci) => {
                                    const isTable = cell.type === 'table' && cell.tableId;
                                    const table = isTable ? tablesInGrid.get(cell.tableId) : null;
                                    const available = isTable ? isTableAvailable(cell.tableId) : false;
                                    const reserved = isTable ? reservedTableIds.has(cell.tableId) : false;
                                    const blocked = isTable ? blockedTableIds.has(cell.tableId) : false;
                                    const primary = isPrimaryCell(cell, ri, ci);
                                    const isSmokingZone = cell.zone === 'smoking';
                                    const hasMarkers = cell.markers && cell.markers.length > 0;

                                    // For multi-cell tables, only render content in the primary cell
                                    const showTableContent = isTable && primary;

                                    // Calculate span for multi-cell tables
                                    let colSpan = 1;
                                    let rowSpan = 1;
                                    if (showTableContent && table) {
                                        const cols = table.cells.map(c => c.col);
                                        const rows = table.cells.map(c => c.row);
                                        colSpan = Math.max(...cols) - Math.min(...cols) + 1;
                                        rowSpan = Math.max(...rows) - Math.min(...rows) + 1;
                                    }

                                    // Skip non-primary cells of multi-cell tables
                                    if (isTable && !primary) return null;

                                    const bgColor = isTable ? 'transparent' : (CELL_COLORS[cell.type] || 'transparent');

                                    return (
                                        <div
                                            key={`${ri}-${ci}`}
                                            className={`${styles.cell} ${isSmokingZone ? styles.smokingZone : ''}`}
                                            style={{
                                                gridColumn: showTableContent ? `${ci + 1} / span ${colSpan}` : undefined,
                                                gridRow: showTableContent ? `${ri + 1} / span ${rowSpan}` : undefined,
                                                backgroundColor: bgColor,
                                            }}
                                        >
                                            {/* Wall markers */}
                                            {hasMarkers && cell.markers.map((m, mi) => (
                                                m.type === 'wall' && (
                                                    <div key={mi} className={`${styles.wall} ${styles[`wall${m.dir}`]}`} />
                                                )
                                            ))}
                                            {hasMarkers && cell.markers.map((m, mi) => (
                                                m.type === 'entry' && (
                                                    <div key={mi} className={`${styles.entry} ${styles[`entry${m.dir}`]}`} />
                                                )
                                            ))}

                                            {/* Table */}
                                            {showTableContent && (
                                                <button
                                                    className={`${styles.tableBtn} ${cell.shape === 'round' ? styles.round : styles.square} ${available ? styles.available : ''} ${reserved ? styles.reserved : ''} ${blocked ? styles.blocked : ''}`}
                                                    onClick={() => handleTableClick(cell.tableId)}
                                                    disabled={!available}
                                                    onMouseEnter={() => setHoveredTable(cell.tableId)}
                                                    onMouseLeave={() => setHoveredTable(null)}
                                                >
                                                    <span className={styles.tableLabel}>{cell.label}</span>
                                                    <span className={styles.tableCapacity}>
                                                        <Users size={10} /> {cell.capacity}p
                                                    </span>
                                                    {reserved && <Lock size={12} className={styles.lockIcon} />}
                                                </button>
                                            )}

                                            {/* Smoking icon */}
                                            {isSmokingZone && !isTable && (
                                                <Cigarette size={10} className={styles.smokingIcon} />
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Zoom Controls */}
            {!loading && (
                <div className={styles.zoomControls}>
                    <button onClick={() => handleZoom(0.2)} className={styles.zoomBtn} title="Zoom In">
                        <Plus size={18} />
                    </button>
                    <button onClick={resetZoom} className={styles.zoomBtn} title="Reset Zoom">
                        <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>{Math.round(zoom * 100)}%</span>
                    </button>
                    <button onClick={() => handleZoom(-0.2)} className={styles.zoomBtn} title="Zoom Out">
                        <Minus size={18} />
                    </button>
                </div>
            )}

            {/* Tap instruction */}
            <p className={styles.instruction}>
                {t('Tap on an available table to select it', 'اضغط على طاولة متاحة لاختيارها')}
            </p>
        </div>
    );
}
