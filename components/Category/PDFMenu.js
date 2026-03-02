'use client';

import { Download } from 'lucide-react';
import styles from './PDFMenu.module.css';
import { useLanguage } from '@/context/LanguageContext';
import PDFBook from './PDFBook';

const PDFMenu = ({ pdfUrl }) => {
    const { t } = useLanguage();

    if (!pdfUrl) {
        return (
            <div className={styles.fallback}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>
                    {t('Menu source missing', 'مصدر المنيو مفقود')}
                </h3>
                <p>{t('PDF URL is not configured for this menu.', 'لم يتم تكوين رابط PDF لهذا المنيو.')}</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <PDFBook pdfUrl={pdfUrl} />
        </div>
    );
};

export default PDFMenu;
