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
            slug = process.env.NEXT_PUBLIC_DEFAULT_ORG_SLUG || '';
        }
    } else {
        const parts = host.split('.');
        // tenant.tabblify.com -> parts = ['tenant', 'tabblify', 'com']
        if (parts.length >= 3) {
            slug = parts[0];
        }
        // No subdomain = landing page (slug stays empty)
    }

    console.log(`[Org Diagnostic] Host: "${host}", Identified Slug: "${slug}"`);

    if (!slug) {
        console.warn(`[Org] No slug identified for host: ${host}`);
        return null;
    }

    try {
        console.log(`[Org] Searching for organization with slug: "${slug}"`);
        if (!supabase) {
            console.error('[Org] Supabase client is not initialized. Please check environment variables.');
            return null;
        }

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
            console.info(`[Org] No organization found for slug: "${slug}".`);
            return slug ? { error: 'ORG_NOT_FOUND', slug } : null;
        }

        // Fetch plan features (baseline)
        const { data: planFeaturesData } = await supabase
            .from('plan_feature_mapping')
            .select(`
                feature_id,
                plan_features ( name )
            `)
            .eq('plan_id', data.subscription_plan_id);

        // Fetch organization overrides
        const { data: orgFeaturesData } = await supabase
            .from('organization_features')
            .select(`
                feature_id,
                enabled,
                plan_features ( name )
            `)
            .eq('organization_id', data.id);

        const activeFeatures = new Set();

        if (planFeaturesData) {
            planFeaturesData.forEach(pf => {
                if (pf.plan_features?.name) {
                    activeFeatures.add(pf.plan_features.name);
                }
            });
        }

        if (orgFeaturesData) {
            orgFeaturesData.forEach(of => {
                const name = of.plan_features?.name;
                if (name) {
                    if (of.enabled) {
                        activeFeatures.add(name);
                    } else {
                        activeFeatures.delete(name);
                    }
                }
            });
        }

        // Add features array to the organization object
        data.features = Array.from(activeFeatures);

        console.log(`[Org] Successfully identified organization: ${data.name} (id: ${data.id}) with features:`, data.features);
        return data;
    } catch (err) {
        console.error('Error fetching organization:', err);
        return null;
    }
});
