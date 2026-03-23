'use client';

import React, { useState, useEffect } from 'react';
import MenuLanding from './MenuLanding';
import TablePopup from './TablePopup';
import styles from './TableReservationManager.module.css';

export default function TableReservationManager({ initialMenus, reservations }) {
    const [activeRes, setActiveRes] = useState(null);

    useEffect(() => {
        const findActiveReservation = () => {
            const now = new Date();
            // sv-SE or en-CA gives YYYY-MM-DD
            const localDate = now.toLocaleDateString('en-CA');
            const localTime = now.toLocaleTimeString('en-GB'); // HH:mm:ss

            const found = reservations.find(r => {
                if (r.reservation_date !== localDate) return false;
                if (!r.start_time || !r.end_time) return false;
                return localTime >= r.start_time && localTime <= r.end_time;
            });

            setActiveRes(found || null);
        };

        findActiveReservation();
        
        // Re-check every 30 seconds to handle reservation start/end transitions while the page is open
        const interval = setInterval(findActiveReservation, 30000);
        return () => clearInterval(interval);
    }, [reservations]);

    return (
        <div className={styles.managerContainer}>
            {activeRes && activeRes.popup_enabled && (
                <TablePopup reservation={activeRes} />
            )}
            <MenuLanding 
                initialMenus={initialMenus} 
                title={activeRes?.page_title_text || undefined}
                subtitle={activeRes?.page_subtitle_text || activeRes?.popup_description || undefined}
                footer={activeRes?.page_footer_text || undefined}
            />
        </div>
    );
}
