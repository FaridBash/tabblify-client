'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useUI } from '@/context/UIContext'

export default function ThemeInjector({ initialTheme }) {
    const { organization } = useUI()

    function applyTheme(t) {
        const root = document.documentElement

        // Brand Colors
        root.style.setProperty('--primary', t.primary_color)
        root.style.setProperty('--primary-rgb', t.primary_rgb)
        root.style.setProperty('--primary-glow', t.primary_glow)
        root.style.setProperty('--primary-dim', t.primary_dim)

        root.style.setProperty('--secondary', t.secondary_color)
        root.style.setProperty('--secondary-light', t.secondary_color)
        root.style.setProperty('--secondary-rgb', t.secondary_rgb)
        root.style.setProperty('--secondary-dark', t.secondary_dark)

        // Text/Base
        root.style.setProperty('--background', t.background_color)
        root.style.setProperty('--foreground', t.foreground_color)

        // Status Colors
        root.style.setProperty('--success', t.success_color)
        root.style.setProperty('--warning', t.warning_color)
        root.style.setProperty('--error', t.error_color)

        // Glassmorphism (derived)
        root.style.setProperty('--glass-bg', `rgba(${t.primary_rgb}, 0.05)`)
        root.style.setProperty('--glass-border', `rgba(${t.primary_rgb}, 0.15)`)
    }

    function resetTheme() {
        const root = document.documentElement
        root.style.setProperty('--primary', '#cba86b')
        root.style.setProperty('--primary-rgb', '203, 168, 107')
        root.style.setProperty('--primary-glow', '#e6c589')
        root.style.setProperty('--primary-dim', '#967d51')
        root.style.setProperty('--secondary', '#122F2A')
        root.style.setProperty('--secondary-light', '#183e38')
        root.style.setProperty('--secondary-rgb', '18, 47, 42')
        root.style.setProperty('--secondary-dark', '#0a1c19')
        root.style.setProperty('--background', '#122F2A')
        root.style.setProperty('--foreground', '#f2ebd9')
        root.style.setProperty('--success', '#22c55e')
        root.style.setProperty('--warning', '#f59e0b')
        root.style.setProperty('--error', '#ef4444')
        root.style.setProperty('--glass-bg', 'rgba(203, 168, 107, 0.05)')
        root.style.setProperty('--glass-border', 'rgba(203, 168, 107, 0.15)')
    }

    async function fetchActiveTheme() {
        if (!organization) return

        try {
            // 1. Get active theme_id from ui_config for this organization
            const { data: config, error: configError } = await supabase
                .from('ui_config')
                .select('theme_id')
                .eq('organization_id', organization.id)
                .maybeSingle()

            if (configError) {
                if (configError.code !== 'PGRST116') console.error('Error fetching config for theme:', configError)
                return
            }
            if (!config?.theme_id) return

            // 2. Get theme details
            const { data: themeData, error: themeError } = await supabase
                .from('themes')
                .select('*')
                .eq('id', config.theme_id)
                .eq('organization_id', organization.id)
                .maybeSingle()

            if (themeError) {
                if (themeError.code !== 'PGRST116') console.error('Error fetching theme details:', themeError)
                return
            }
            if (themeData) {
                applyTheme(themeData)
            }
        } catch (error) {
            if (error && Object.keys(error).length > 0) {
                console.error('Unexpected error in ThemeInjector:', error)
            }
        }
    }

    useEffect(() => {
        if (!organization) {
            resetTheme()
            return
        }

        if (initialTheme) {
            applyTheme(initialTheme)
        } else {
            fetchActiveTheme()
        }

        if (!supabase) return;

        const subscription = supabase
            .channel(`theme-changes-${organization.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'ui_config',
                    filter: `organization_id=eq.${organization.id}`
                },
                () => fetchActiveTheme()
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'themes',
                    filter: `organization_id=eq.${organization.id}`
                },
                () => fetchActiveTheme()
            )
            .subscribe()

        return () => {
            if (subscription) {
                subscription.unsubscribe()
            }
        }
    }, [organization, initialTheme])

    return null
}
