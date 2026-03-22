import React from 'react';
import styles from './loading.module.css';

export default function MenuLoading() {
    return (
        <div className={styles.container}>
            <div className={styles.spinnerWrapper}>
                <div className={styles.loader}></div>
                <div className={styles.loadingText}>Loading menu...</div>
            </div>
        </div>
    );
}
