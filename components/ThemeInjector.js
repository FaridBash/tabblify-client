'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function ThemeInjector({ initialTheme }) {
    useEffect(() => {
        if (initialTheme) {
            applyTheme(initialTheme)
        } else {
            fetchActiveTheme()
        }

        // Subscribe to changes in ui_config or themes
        const subscription = supabase
            .channel('theme-changes-client')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ui_config' }, () => {
                fetchActiveTheme()
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'themes' }, () => {
                fetchActiveTheme()
            })
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [initialTheme])

    async function fetchActiveTheme() {
        try {
            // 1. Get active theme_id from ui_config
            const { data: config, error: configError } = await supabase
                .from('ui_config')
                .select('theme_id')
                .limit(1)
                .single()

            if (configError) throw configError
            if (!config?.theme_id) return

            // 2. Get theme details
            const { data: themeData, error: themeError } = await supabase
                .from('themes')
                .select('*')
                .eq('id', config.theme_id)
                .single()

            if (themeError) throw themeError
            if (themeData) {
                applyTheme(themeData)
            }
        } catch (error) {
            console.error('Error fetching theme:', error)
        }
    }

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

    return null
}
