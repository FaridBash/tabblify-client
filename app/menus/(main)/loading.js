import React from 'react';
import pageStyles from './page.module.css';
import styles from './loading.module.css';

export default function MenusLoading() {
    return (
        <div className={pageStyles.container}>
            <div className={styles.container}>
                {/* Skeleton for OrgBranding */}
                <div className={styles.logoContainer}>
                    <div className={`${styles.skeletonLogo} skeleton`} />
                    <div className={styles.branding}>
                        <div className={`${styles.skeletonTitle} skeleton`} />
                        <div className={`${styles.skeletonSubtitle} skeleton`} />
                    </div>
                </div>

                {/* Skeleton for MenuList */}
                <div className={styles.list}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={styles.itemWrapper}>
                            <div className={`${styles.skeletonPill} skeleton glass-card`} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
