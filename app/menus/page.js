import { supabase } from '@/lib/supabase';
import PublicMenuList from '@/components/Home/PublicMenuList';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

async function getLinkedMenus() {
    // Fetch ui_config to get the list of linked menu IDs
    const { data: config, error: configError } = await supabase
        .from('ui_config')
        .select('main_menu_linked_menus')
        .single();

    if (configError || !config?.main_menu_linked_menus?.length) {
        return [];
    }

    const menuIds = config.main_menu_linked_menus;

    // Fetch those menus
    const { data: menus, error: menusError } = await supabase
        .from('menus')
        .select('*')
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
    const menus = await getLinkedMenus();

    return (
        <div className={styles.container}>
            <PublicMenuList initialMenus={menus} />
        </div>
    );
}
