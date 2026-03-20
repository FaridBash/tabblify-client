import { supabase } from '@/lib/supabase';
import MenuLanding from '@/components/Home/MenuLanding';
import styles from './page.module.css';
import { getOrganization } from '@/lib/org';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getLinkedMenus(organizationId) {
    if (!organizationId) return [];

    // Fetch ui_config for THIS organization to get the list of linked menu IDs
    const { data: config, error: configError } = await supabase
        .from('ui_config')
        .select('main_menu_linked_menus')
        .eq('organization_id', organizationId)
        .single();

    if (configError || !config?.main_menu_linked_menus?.length) {
        // Fallback: fetch ALL active menus for this organization if no specific links are set
        const { data: allMenus, error: allMenusError } = await supabase
            .from('menus')
            .select('*')
            .eq('organization_id', organizationId)
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (allMenusError) {
            console.error('Error fetching fallback menus:', allMenusError);
            return [];
        }
        return allMenus || [];
    }

    const menuIds = config.main_menu_linked_menus;

    // Fetch those specific menus
    const { data: menus, error: menusError } = await supabase
        .from('menus')
        .select('*')
        .eq('organization_id', organizationId)
        .in('id', menuIds)
        .eq('is_active', true);

    if (menusError) {
        console.error('Error fetching linked menus:', menusError);
        return [];
    }

    // Preserve the order from main_menu_linked_menus
    return menuIds
        .map(id => menus.find(m => m.id === id))
        .filter(Boolean);
}

export default async function MenusPage() {
    const organization = await getOrganization();

    if (organization && !organization.features?.includes('emenu')) {
        redirect('/');
    }

    const menus = await getLinkedMenus(organization?.id);

    return (
        <div className={styles.container}>
            <MenuLanding initialMenus={menus} />
        </div>
    );
}
