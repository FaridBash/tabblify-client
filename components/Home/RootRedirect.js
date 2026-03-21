'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useUI } from '@/context/UIContext';
import { Calendar, UtensilsCrossed, ClipboardList, ScanQrCode, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './RootRedirect.module.css';
import OrgBranding from './OrgBranding';

export default function RootRedirect() {
    const router = useRouter();
    const { t } = useLanguage();
    const { uiConfig, organization } = useUI();

    const hasReservations = organization?.features?.includes('reservations');
    const hasEMenu = organization?.features?.includes('emenu');


    // If no organization is identified (Root Landing Mode), show a premium generic landing page
    if (!organization) {
        return (
            <div className={styles.container}>
                <div 
                    className="app-background" 
                    style={{ 
                        backgroundImage: `url('/tabblify_landing_bg.png')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 1
                    }} 
                />
                
                <style dangerouslySetInnerHTML={{ __html: `
                    .main-content {
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        position: relative;
                        z-index: 1;
                    }
                    .app-background::after {
                        background: radial-gradient(circle at center, rgba(10, 28, 25, 0.4) 0%, rgba(0, 0, 0, 0.8) 100%) !important;
                    }
                `}} />

                <div className={styles.landingContent}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                        className={styles.brandBadge}
                    >
                        <Sparkles size={16} className={styles.sparkleIcon} />
                        <span>{t('THE FUTURE OF DINING', 'مستقبل الضيافة')}</span>
                    </motion.div>

                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        <h1 className={styles.heroTitle}>
                            tabblify
                        </h1>
                        <h2 className={styles.heroSubtitle}>
                            {t('Elevate Your Experience', 'ارتقِ بتجربتك')}
                        </h2>
                    </motion.div>

                    <motion.p 
                        className={styles.heroDescription}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                    >
                        {t(
                            'Discover a seamless world of interactive dining and hospitality. Tabblify connects you to premium venues with state-of-the-art digital experiences.',
                            'اكتشف عالماً سلساً من الضيافة التفاعلية. يربطك تابليفاي بأرقى الأماكن من خلال تجارب رقمية متطورة.'
                        )}
                    </motion.p>

                    <motion.div 
                        className={styles.featureGrid}
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                    >
                        <div className={styles.featureItem}>
                            <Zap size={24} className={styles.featureIcon} />
                            <span>{t('Instant Access', 'وصول فوري')}</span>
                        </div>
                        <div className={styles.featureItem}>
                            <ShieldCheck size={24} className={styles.featureIcon} />
                            <span>{t('Secure & Fast', 'آمن وسريع')}</span>
                        </div>
                        <div className={styles.featureItem}>
                            <UtensilsCrossed size={24} className={styles.featureIcon} />
                            <span>{t('Digital Menus', 'قوائم رقمية')}</span>
                        </div>
                    </motion.div>

                    <motion.div 
                        className={styles.scanPrompt}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
                    >
                        <ScanQrCode size={24} />
                        <span>{t('Scan a Table QR to Begin', 'امسح رمز الطاولة للبدء')}</span>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Otherwise, show the organization-specific home screen with buttons
    return (
        <div className={styles.container}>
            <style dangerouslySetInnerHTML={{
                __html: `
                .main-content {
                    padding-bottom: 0 !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: flex-start !important;
                }
                ${(uiConfig?.main_background_mobile_url || uiConfig?.background_image_mobile_url) ? `
                .app-background {
                    background-image: url("${uiConfig?.main_background_mobile_url || uiConfig.background_image_mobile_url}") !important;
                }
                ` : ''}
            `}} />

            <OrgBranding uiConfig={uiConfig} mode="home" />

            {hasReservations && uiConfig?.main_show_button !== false && (
                <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className={styles.reserveButton}
                    onClick={() => router.push('/reserve')}
                >
                    <Calendar className={styles.reserveIcon} size={28} />
                    <span className={styles.reserveTitle}>
                        {t(uiConfig?.main_button_en, uiConfig?.main_button_ar) || t('Reserve Your Table', 'احجز طاولتك')}
                    </span>
                </motion.button>
            )}

            {hasEMenu && uiConfig?.main_show_menu_button !== false && (
                <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={styles.menuButton}
                    onClick={() => router.push('/menus')}
                >
                    <UtensilsCrossed className={styles.menuIcon} size={28} />
                    <span className={styles.menuTitle}>
                        {t(uiConfig?.main_menu_button_en, uiConfig?.main_menu_button_ar) || t('View Our Menus', 'عرض قوائمنا')}
                    </span>
                </motion.button>
            )}

            {hasReservations && (
                <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={styles.myResButton}
                    onClick={() => router.push('/my-reservations')}
                >
                    <ClipboardList className={styles.myResIcon} size={28} />
                    <span className={styles.myResTitle}>
                        {t('My Reservations', 'حجوزاتي')}
                    </span>
                </motion.button>
            )}
        </div>
    );
}
