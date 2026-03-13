import { headers } from 'next/headers';
import { supabase } from './supabase';
import { cache } from 'react';

/**
 * Gets the organization from the subdomain.
 * In production: tenant.tabblify.com -> 'tenant'
 * In development: tenant.localhost:3000 -> 'tenant'
 */
export const getOrganization = cache(async () => {
    const host = (await headers()).get('host');
    if (!host) return null;

    let slug = '';

    if (host.includes('localhost') || host.includes('127.0.0.1')) {
        const parts = host.split('.');
        // Check if there's a subdomain (e.g., myorg.localhost:3000)
        if (parts.length > 1 && !parts[0].includes('localhost')) {
            slug = parts[0];
        } else {
            // Fallback for local dev without subdomain
            slug = process.env.NEXT_PUBLIC_DEFAULT_ORG_SLUG || 'default';
        }
    } else {
        const parts = host.split('.');
        // tenant.tabblify.com -> parts = ['tenant', 'tabblify', 'com']
        if (parts.length >= 3) {
            slug = parts[0];
        } else {
            // No subdomain - handle as landing page or default
            return null;
        }
    }

    if (!slug) {
        console.warn(`[Org] No slug identified for host: ${host}`);
        return null;
    }

    try {
        console.log(`[Org] Searching for organization with slug: "${slug}"`);
        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();

        if (error) {
            console.error(`[Org] DB Error fetching organization "${slug}":`, error);
            return null;
        }

        if (!data) {
            console.error(`[Org] Organization NOT FOUND for slug: "${slug}". Available slugs are likely different.`);
            return null;
        }

        console.log(`[Org] Successfully identified organization: ${data.name} (id: ${data.id})`);
        return data;
    } catch (err) {
        console.error('Error fetching organization:', err);
        return null;
    }
});
