'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useUI } from '@/context/UIContext'

export default function ThemeInjector({ initialTheme }) {
    const { organization } = useUI()

    useEffect(() => {
        if (!organization) return

        if (initialTheme) {
            applyTheme(initialTheme)
        } else {
            fetchActiveTheme()
        }

        // Subscribe to changes in ui_config or themes for THIS organization
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
            subscription.unsubscribe()
        }
    }, [initialTheme, organization])

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
                // Ignore "no results" error if it happens (PGRST116 usually for .single(), maybeSingle() returns null data)
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
            // Only log if it's not a standard empty error
            if (error && Object.keys(error).length > 0) {
                console.error('Unexpected error in ThemeInjector:', error)
            }
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
