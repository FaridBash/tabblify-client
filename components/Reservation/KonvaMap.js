'use client';

import React, { useMemo } from 'react';
import { Stage, Layer, Rect, Circle, Text, Group, Path } from 'react-konva';

const ITEM_TYPES = {
    WALL: 'wall',
    TABLE: 'table',
    ROOM: 'room',
    WINDOW: 'window',
    DOOR: 'door',
    PLANT: 'plant',
    PLANT_SPIKY: 'plant_spiky',
    BAR: 'bar',
    SOFA: 'sofa',
    TV: 'tv',
};

function getChairPositions(capacity, tW, tH, isRound) {
    const chairs = [];
    const chairSize = 18;

    if (isRound) {
        const radius = tW / 2;
        const distance = radius + chairSize / 2 + 4;
        for (let i = 0; i < capacity; i++) {
            const angle = (i * 2 * Math.PI) / capacity;
            chairs.push({
                x: distance * Math.cos(angle),
                y: distance * Math.sin(angle),
                rotation: (angle * 180) / Math.PI + 90,
                angle: angle,
            });
        }
    } else {
        const distX = tW / 2 + chairSize / 2 + 4;
        const distY = tH / 2 + chairSize / 2 + 4;

        let topCount = 0, botCount = 0, leftCount = 0, rightCount = 0;

        if (capacity === 2) {
            topCount = 1; botCount = 1;
        } else if (capacity === 4) {
            topCount = 1; botCount = 1; leftCount = 1; rightCount = 1;
        } else {
            leftCount = 1; rightCount = 1;
            const remaining = capacity - 2;
            topCount = Math.ceil(remaining / 2);
            botCount = Math.floor(remaining / 2);
        }

        const startXTop = topCount > 1 ? -((topCount - 1) * (chairSize + 4)) / 2 : 0;
        for (let i = 0; i < topCount; i++) {
            chairs.push({ x: startXTop + i * (chairSize + 4), y: -distY, rotation: 0 });
        }

        const startXBot = botCount > 1 ? -((botCount - 1) * (chairSize + 4)) / 2 : 0;
        for (let i = 0; i < botCount; i++) {
            chairs.push({ x: startXBot + i * (chairSize + 4), y: distY, rotation: 180 });
        }

        const startYLeft = leftCount > 1 ? -((leftCount - 1) * (chairSize + 4)) / 2 : 0;
        for (let i = 0; i < leftCount; i++) {
            chairs.push({ x: -distX, y: startYLeft + i * (chairSize + 4), rotation: -90 });
        }

        const startYRight = rightCount > 1 ? -((rightCount - 1) * (chairSize + 4)) / 2 : 0;
        for (let i = 0; i < rightCount; i++) {
            chairs.push({ x: distX, y: startYRight + i * (chairSize + 4), rotation: 90 });
        }
    }
    return chairs;
}

export default function KonvaMap({
    items, dimensions, zoom, COLORS, onTableSelect, isTableAvailable,
    reservedTableIds, blockedTableIds, selectedTable
}) {

    const renderItem = (item) => {
        const { type, shape, x, y, width, height, rotation, label, tableId, capacity, bgColor, tileStroke, linePattern } = item;
        const w = width || 60;
        const h = height || 60;

        const commonProps = {
            onClick: () => {
                if (type === ITEM_TYPES.TABLE) {
                    const available = isTableAvailable(tableId);
                    if (available || selectedTable?.id === tableId) {
                        onTableSelect({ id: tableId, label, capacity, shape, area: item.area });
                    }
                }
            },
            onTap: () => {
                if (type === ITEM_TYPES.TABLE) {
                    const available = isTableAvailable(tableId);
                    if (available || selectedTable?.id === tableId) {
                        onTableSelect({ id: tableId, label, capacity, shape, area: item.area });
                    }
                }
            }
        };

        switch (type) {
            case ITEM_TYPES.ROOM:
                const tw = w;
                const th = h;
                let patternLines = null;
                const isDining = label === 'Dining Area' || label === 'Wooden Floor';
                const isTile = label === 'Entry' || label === 'Kitchen' || label === 'Parquet Floor';

                const isKitchen = label?.toLowerCase() === 'kitchen';
                const isTargetArea = !isKitchen && (
                    label === 'Main Area' ||
                    label === 'VIP Area' ||
                    label === 'Patio' ||
                    label?.toLowerCase().includes('smoking')
                );

                let strokeColor = tileStroke;
                if (!strokeColor) {
                    strokeColor = isDining ? 'rgba(69, 26, 3, 0.4)' : 'rgba(180, 83, 9, 0.2)';
                }

                if (linePattern || isDining || isTile) {
                    const lines = [];
                    const tileSize = 45;
                    const plankSize = tileSize / 3;

                    for (let i = 0; i < tw; i += tileSize) {
                        for (let j = 0; j < th; j += tileSize) {
                            const isAlt = (Math.floor(i / tileSize) + Math.floor(j / tileSize)) % 2 === 0;

                            if (isAlt) {
                                // Vertical Planks
                                lines.push(<Path key={`v1-${i}-${j}`} data={`M${i + plankSize},${j} L${i + plankSize},${j + tileSize}`} stroke={strokeColor} strokeWidth={1} />);
                                lines.push(<Path key={`v2-${i}-${j}`} data={`M${i + plankSize * 2},${j} L${i + plankSize * 2},${j + tileSize}`} stroke={strokeColor} strokeWidth={1} />);
                            } else {
                                // Horizontal Planks
                                lines.push(<Path key={`h1-${i}-${j}`} data={`M${i},${j + plankSize} L${i + tileSize},${j + plankSize}`} stroke={strokeColor} strokeWidth={1} />);
                                lines.push(<Path key={`h2-${i}-${j}`} data={`M${i},${j + plankSize * 2} L${i + tileSize},${j + plankSize * 2}`} stroke={strokeColor} strokeWidth={1} />);
                            }
                            // Tile border
                            lines.push(<Rect key={`b-${i}-${j}`} x={i} y={j} width={tileSize} height={tileSize} stroke={strokeColor} strokeWidth={0.5} opacity={isKitchen ? 1 : 0.5} />);
                        }
                    }
                    patternLines = <Group opacity={isTargetArea ? 0.3 : 1}>{lines}</Group>;
                }

                let roomIcon = null;
                const baseIconColor = item.textColor || "#64748b";
                const iconLabel = label?.toLowerCase() || '';

                if (isKitchen || iconLabel.includes('entry')) {
                    const iconPath = "M17,11c0.552,0,1-0.448,1-1c0-2.206-1.794-4-4-4c-1.371,0-2.581,0.697-3.297,1.751C10.155,7.28,9.155,7,8,7 C5.794,7,4,8.794,4,11c0,0.552,0.448,1,1,1v5c0,0.552,0.448,1,1,1h10c0.552,0,1-0.448,1-1v-5H17z M14,16H8v-2h6V16z";
                    roomIcon = (
                        <Group x={tw / 2} y={th / 2} scaleX={2.2} scaleY={2.2} offsetX={11} offsetY={11} opacity={1}>
                            <Path data={iconPath} fill="black" opacity={0.15} offsetY={1} />
                            <Path data={iconPath} fill={baseIconColor} />
                        </Group>
                    );
                } else if (iconLabel.includes('smoking') && !iconLabel.includes('non')) {
                    const iconPath = "M18,16H2V13H18V16M19,16H22V13H19V16M11,11C11,11 13,10 13,8C13,6 11,5 11,5M7,11C7,11 9,10 9,8C9,6 7,5 7,5";
                    roomIcon = (
                        <Group x={tw / 2} y={th / 2} scaleX={2} scaleY={2} offsetX={12} offsetY={10} opacity={1}>
                            <Path data={iconPath} fill="black" opacity={0.15} offsetY={1} />
                            <Path data={iconPath} fill={baseIconColor} />
                        </Group>
                    );
                } else if (iconLabel.includes('non smoking') || iconLabel.includes('non-smoking')) {
                    const cigPath = "M18,16H2V13H18V16M19,16H22V13H19V16M11,11C11,11 13,10 13,8C13,6 11,5 11,5M7,11C7,11 9,10 9,8C9,6 7,5 7,5";
                    const slashPath = "M2,2L22,22";
                    roomIcon = (
                        <Group x={tw / 2} y={th / 2} scaleX={2} scaleY={2} offsetX={12} offsetY={10} opacity={1}>
                            <Path data={cigPath} fill="black" opacity={0.15} offsetY={1} />
                            <Path data={cigPath} fill={baseIconColor} />
                            <Path data={slashPath} stroke="#ef4444" strokeWidth={3} />
                        </Group>
                    );
                } else if (iconLabel.includes('main area') || iconLabel.includes('dining area')) {
                    const iconPath = "M3 3h7v7H3V3zm11 0h7v7h-7V3zm-11 11h7v7H3v-7zm11 0h7v7h-7v-7z"; // 2x2 Grid
                    const isMain = iconLabel.includes('main area');
                    roomIcon = (
                        <Group x={tw / 2} y={th / 2} scaleX={2.5} scaleY={2.5} offsetX={12} offsetY={12} opacity={isMain ? 0.8 : 0.25}>
                            <Path data={iconPath} fill="black" opacity={0.15} offsetY={1} />
                            <Path data={iconPath} fill="white" opacity={0.25} offsetY={-0.5} />
                            <Path data={iconPath} fill={baseIconColor} />
                        </Group>
                    );
                } else if (iconLabel.includes('vip area')) {
                    const iconPath = "M5 21h14a2 2 0 0 0 2-2V7l-4.5 9-4.5-9-4.5 9L3 7v12a2 2 0 0 0 2 2Z"; // Crown
                    roomIcon = (
                        <Group x={tw / 2} y={th / 2} scaleX={2.5} scaleY={2.5} offsetX={12} offsetY={12} opacity={0.8}>
                            <Path data={iconPath} fill="black" opacity={0.15} offsetY={1} />
                            <Path data={iconPath} fill="white" opacity={0.25} offsetY={-0.5} />
                            <Path data={iconPath} fill="#d97706" />
                        </Group>
                    );
                } else if (iconLabel.includes('patio')) {
                    const iconPath = "M12 2 3 9h3l-3 7h5V22h4V16h5l-3-7h3L12 2Z"; // Pine/Tree
                    roomIcon = (
                        <Group x={tw / 2} y={th / 2} scaleX={2.5} scaleY={2.5} offsetX={12} offsetY={12} opacity={0.8}>
                            <Path data={iconPath} fill="black" opacity={0.15} offsetY={1} />
                            <Path data={iconPath} fill="white" opacity={0.25} offsetY={-0.5} />
                            <Path data={iconPath} fill="#16a34a" />
                        </Group>
                    );
                } else if (iconLabel.includes('restroom') || iconLabel.includes('bathroom') || iconLabel.includes('w.c')) {
                    const manPath = "M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm2 19v-6h4l-4-6H8l-4 6h4v6h4z";
                    const womanPath = "M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm2.4 11l1.6 8h-8l1.6-8H6l4-6h4l4 6h-3.6z";
                    roomIcon = (
                        <Group x={tw / 2} y={th / 2} scaleX={2} scaleY={2} offsetX={12} offsetY={10} opacity={0.35}>
                            <Path x={-7} data={manPath} fill="black" opacity={0.15} offsetY={1} />
                            <Path x={7} data={womanPath} fill="black" opacity={0.15} offsetY={1} />
                            <Path x={-7} data={manPath} fill="white" opacity={0.25} offsetY={-0.5} />
                            <Path x={7} data={womanPath} fill="white" opacity={0.25} offsetY={-0.5} />
                            <Path x={-7} data={manPath} fill={baseIconColor} />
                            <Path x={7} data={womanPath} fill={baseIconColor} />
                        </Group>
                    );
                }

                return (
                    <Group
                        key={item.id}
                        x={x}
                        y={y}
                        rotation={rotation}
                        clipX={0}
                        clipY={0}
                        clipWidth={tw}
                        clipHeight={th}
                    >
                        <Rect
                            width={tw}
                            height={th}
                            fill={bgColor || (isDining ? COLORS.floor : COLORS.tile)}
                            stroke={strokeColor}
                            strokeWidth={1}
                            opacity={isTargetArea ? 0.3 : 1}
                        />
                        {patternLines}
                        {roomIcon}
                    </Group>
                );

            case ITEM_TYPES.WALL:
                return (
                    <Group key={item.id} x={x} y={y} rotation={rotation}>
                        <Rect width={w} height={h} fill="#1e293b" shadowBlur={10} shadowColor="black" shadowOpacity={0.5} shadowOffsetY={5} cornerRadius={2} />
                        <Rect width={w} height={h} stroke="#475569" strokeWidth={1} cornerRadius={2} />
                    </Group>
                );

            case ITEM_TYPES.WINDOW:
                return (
                    <Group key={item.id} x={x} y={y} rotation={rotation}>
                        <Rect width={w} height={h} fill="#bae6fd" opacity={0.8} shadowBlur={10} shadowColor="black" shadowOpacity={0.4} shadowOffsetY={5} />
                        <Rect width={w} height={h} stroke="#38bdf8" strokeWidth={2} />
                        <Path data={`M0,${h / 2} L${w},${h / 2}`} stroke="#0ea5e9" strokeWidth={1} />
                    </Group>
                );

            case ITEM_TYPES.DOOR:
                return (
                    <Group key={item.id} x={x} y={y} rotation={rotation}>
                        <Path data={`M0,${h / 2} Q${w},0 ${w},${-w}`} stroke="#94a3b8" strokeWidth={1} dash={[4, 4]} />
                        <Rect width={w} height={h} fill="#cbd5e1" cornerRadius={1} shadowBlur={4} shadowColor="black" shadowOpacity={0.3} shadowOffsetY={2} />
                        <Rect x={0} y={-w} width={h} height={w} fill="#d97706" shadowBlur={6} shadowColor="black" shadowOpacity={0.4} shadowOffsetY={4} />
                    </Group>
                );

            case ITEM_TYPES.BAR:
                const stoolsCount = Math.floor(w / 40);
                return (
                    <Group key={item.id} x={x} y={y} rotation={rotation}>
                        {Array.from({ length: stoolsCount }).map((_, i) => (
                            <Circle key={`stool-${i}`} x={20 + i * 40} y={h + 12} radius={10} fill="#334155" stroke="#1e293b" strokeWidth={2} shadowBlur={4} shadowColor="black" shadowOpacity={0.3} />
                        ))}
                        <Rect width={w} height={h} fill="#78350f" cornerRadius={10} shadowBlur={10} shadowColor="black" shadowOpacity={0.5} />
                        <Rect x={4} y={4} width={w - 8} height={h - 8} fill="#92400e" cornerRadius={6} />
                        <Rect x={10} y={10} width={w - 20} height={h - 20} fill="#b45309" cornerRadius={4} />
                    </Group>
                );

            case ITEM_TYPES.PLANT:
            case 'plant_spiky':
                const pr = Math.min(w, h) / 2;
                if (type === 'plant_spiky') {
                    const spikyLeaves = [];
                    for (let i = 0; i < 8; i++) {
                        spikyLeaves.push(<Path key={`dark-${i}`} d={`M0,0 Q${pr * 0.3},${-pr * 0.2} ${pr * 1.1},0 Q${pr * 0.3},${pr * 0.2} 0,0`} fill="#4d7c0f" rotation={i * 45 + 22.5} />);
                    }
                    for (let i = 0; i < 8; i++) {
                        spikyLeaves.push(<Path key={`light-${i}`} d={`M0,0 Q${pr * 0.25},${-pr * 0.15} ${pr * 0.9},0 Q${pr * 0.25},${pr * 0.15} 0,0`} fill="#65a30d" rotation={i * 45} />);
                    }
                    return (
                        <Group key={item.id} x={x} y={y} rotation={rotation}>
                            <Circle x={pr * 0.25} y={pr * 0.25} radius={pr * 0.8} fill="rgba(0,0,0,0.25)" />
                            <Group x={pr} y={pr}>{spikyLeaves}</Group>
                            <Circle x={pr} y={pr} radius={pr * 0.1} fill="#a3e635" />
                        </Group>
                    );
                }
                const bumps = [];
                for (let i = 0; i < 10; i++) {
                    const angle = (i * Math.PI * 2) / 10;
                    bumps.push(<Circle key={`bump-${i}`} x={pr + Math.cos(angle) * (pr * 0.55)} y={pr + Math.sin(angle) * (pr * 0.55)} radius={pr * 0.5} fill="#65a30d" />);
                }
                return (
                    <Group key={item.id} x={x} y={y} rotation={rotation}>
                        <Circle x={pr * 1.25} y={pr * 1.25} radius={pr * 0.9} fill="rgba(0,0,0,0.25)" />
                        <Circle x={pr} y={pr} radius={pr * 0.8} fill="#4d7c0f" />
                        {bumps}
                        <Circle x={pr} y={pr} radius={pr * 0.75} fill="#65a30d" />
                        <Circle x={pr} y={pr} radius={pr * 0.5} fill="#84cc16" />
                    </Group>
                );

            case ITEM_TYPES.SOFA:
                return (
                    <Group key={item.id} x={x} y={y} rotation={rotation}>
                        <Rect width={w} height={h} fill="#334155" cornerRadius={8} shadowBlur={8} shadowColor="black" shadowOpacity={0.4} shadowOffsetY={4} />
                        <Rect x={4} y={4} width={w - 8} height={12} fill="#1e293b" cornerRadius={4} />
                        <Rect x={4} y={16} width={12} height={h - 20} fill="#475569" cornerRadius={4} />
                        <Rect x={w - 16} y={16} width={12} height={h - 20} fill="#475569" cornerRadius={4} />
                        <Rect x={18} y={18} width={(w - 36) / 2 - 2} height={h - 24} fill="#475569" cornerRadius={4} />
                        <Rect x={18 + (w - 36) / 2 + 2} y={18} width={(w - 36) / 2 - 2} height={h - 24} fill="#475569" cornerRadius={4} />
                    </Group>
                );

            case ITEM_TYPES.TV:
                return (
                    <Group key={item.id} x={x} y={y} rotation={rotation}>
                        <Rect x={2} y={2} width={w} height={h} fill="#000000" opacity={0.5} shadowBlur={6} />
                        <Rect width={w} height={h} fill="#0f172a" stroke="#334155" strokeWidth={2} cornerRadius={2} />
                        <Rect x={2} y={2} width={w - 4} height={h - 4} fill="#000000" />
                        <Circle x={w - 6} y={h - 3} radius={1.5} fill="#ef4444" shadowColor="#ef4444" shadowBlur={2} />
                    </Group>
                );

            case ITEM_TYPES.TABLE:
                const isSelected = selectedTable?.id === tableId;
                const available = isTableAvailable(tableId);
                const reserved = reservedTableIds.has(tableId);
                const blocked = blockedTableIds.has(tableId);

                const isRound = shape === 'round';
                const cap = capacity || 2;
                const radius = cap > 6 ? 40 : cap > 2 ? 30 : 20;
                const tW = isRound ? radius * 2 : radius * 2.5;
                const tH = isRound ? radius * 2 : radius * 2;
                const chairs = getChairPositions(cap, tW, tH, isRound);

                let strokeColorTable = isSelected ? '#db2777' : (reserved ? COLORS.reserved : (blocked ? COLORS.blocked : COLORS.available));
                let strokeWidthTable = isSelected ? 4 : 2;

                return (
                    <Group key={item.id} x={x} y={y} rotation={rotation} {...commonProps}>
                        {chairs.map((pos, i) => (
                            <Group key={`chair-${i}`} x={pos.x} y={pos.y} rotation={pos.rotation}>
                                <Rect x={-10} y={-10} width={20} height={20} fill="#0f172a" cornerRadius={5} shadowBlur={5} shadowColor="black" shadowOpacity={0.4} />
                                <Rect x={-8} y={-8} width={16} height={16} fill="#334155" cornerRadius={4} />
                                <Rect x={-12} y={-12} width={24} height={7} fill="#1e293b" cornerRadius={3} />
                                <Rect x={-12} y={-13} width={24} height={2} fill="#0f172a" cornerRadius={1} />
                            </Group>
                        ))}

                        {isRound ? (
                            <Group>
                                <Circle radius={radius + 4} fillRadialGradientStartPoint={{ x: 0, y: 0 }} fillRadialGradientStartRadius={radius} fillRadialGradientEndPoint={{ x: 0, y: 0 }} fillRadialGradientEndRadius={radius + 6} fillRadialGradientColorStops={[0, 'rgba(0,0,0,0.3)', 1, 'transparent']} />
                                <Circle radius={radius} fill={isSelected ? '#db2777' : '#78350f'} stroke={strokeColorTable} strokeWidth={strokeWidthTable} />
                                <Circle radius={radius - 3} stroke="#92400e" strokeWidth={1.5} opacity={0.5} />
                                <Path data={`M ${-radius * 0.7} ${-radius * 0.4} A ${radius} ${radius} 0 0 1 ${radius * 0.7} ${-radius * 0.4}`} stroke="white" strokeWidth={3} opacity={0.15} lineCap="round" />
                                {chairs.map((pos, i) => {
                                    const plateDist = radius * 0.72;
                                    return <Circle key={`p-${i}`} x={Math.cos(pos.angle) * plateDist} y={Math.sin(pos.angle) * plateDist} radius={radius * 0.18} fill="#f8fafc" opacity={0.4} />
                                })}
                            </Group>
                        ) : (
                            <Rect x={-tW / 2} y={-tH / 2} width={tW} height={tH} fill={isSelected ? '#db2777' : "#b45309"} stroke={strokeColorTable} strokeWidth={strokeWidthTable} cornerRadius={4} shadowBlur={15} shadowColor="black" shadowOffsetY={5} shadowOpacity={0.6} />
                        )}

                        <Group>
                            {reserved ? (
                                <>
                                    {/* Red Cover for Reserved Tables */}
                                    {isRound ? (
                                        <Circle radius={radius} fill="#ef4444" opacity={0.5} />
                                    ) : (
                                        <Rect x={-tW / 2} y={-tH / 2} width={tW} height={tH} fill="#ef4444" opacity={0.5} cornerRadius={4} />
                                    )}
                                    <Text
                                        x={isRound ? -radius : -tW / 2}
                                        y={-6}
                                        width={isRound ? radius * 2 : tW}
                                        text="RESERVED"
                                        align="center"
                                        fontSize={isRound ? radius * 0.35 : 10}
                                        fill="#ffffff"
                                        fontStyle="bold"
                                        shadowColor="black"
                                        shadowBlur={3}
                                    />
                                </>
                            ) : (
                                <Text
                                    x={isRound ? -radius : -tW / 2}
                                    y={isRound ? -radius / 4 : -6}
                                    width={isRound ? radius * 2 : tW}
                                    text={`${cap}p`}
                                    align="center"
                                    fontSize={isRound ? radius * 0.6 : 16}
                                    fill={isSelected ? '#ffffff' : "#fcd34d"}
                                    fontStyle="bold"
                                    opacity={0.9}
                                />
                            )}
                        </Group>
                    </Group>
                );
            default:
                return null;
        }
    };

    return (
        <Stage
            width={dimensions.width}
            height={dimensions.height}
            draggable
            scaleX={zoom}
            scaleY={zoom}
        >
            <Layer>
                <Rect x={-5000} y={-5000} width={10000} height={10000} fill="#f8fafc" />
                {Array.from({ length: 200 }).map((_, i) => (
                    <React.Fragment key={`grid-${i}`}>
                        <Path data={`M-5000,${i * 50 - 5000} L5000,${i * 50 - 5000}`} stroke="#e2e8f0" strokeWidth={0.5} />
                        <Path data={`M${i * 50 - 5000},-5000 L${i * 50 - 5000},5000`} stroke="#e2e8f0" strokeWidth={0.5} />
                    </React.Fragment>
                ))}
            </Layer>
            <Layer>
                {items.filter(i => i.type === ITEM_TYPES.ROOM).map(renderItem)}
            </Layer>
            <Layer>
                {items.filter(i => i.type !== ITEM_TYPES.ROOM).map(renderItem)}
            </Layer>
        </Stage>
    );
}
