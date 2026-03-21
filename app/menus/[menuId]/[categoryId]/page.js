import { supabase } from '@/lib/supabase';
import ItemList from '@/components/Items/ItemList';
import styles from './page.module.css';
import { getOrganization } from '@/lib/org';

export const dynamic = 'force-dynamic';

async function getItems(categoryId, organizationId) {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('category_id', categoryId)
        .eq('organization_id', organizationId)
        .eq('is_active', true);

    if (error) {
        console.error('Error fetching items:', error);
        return [];
    }
    return data;
}

async function getCategory(categoryId, organizationId) {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('categories')
        .select('*, menus(*)')
        .eq('id', categoryId)
        .eq('organization_id', organizationId)
        .single();

    if (error) return null;
    return data;
}

export default async function PublicItemsPage({ params }) {
    const { menuId, categoryId } = await params;
    const organization = await getOrganization();

    if (!organization) return <div className={styles.container} />;

    const items = await getItems(categoryId, organization.id);
    const category = await getCategory(categoryId, organization.id);

    return (
        <div className={styles.container}>
            <ItemList initialItems={items} category={category} />
        </div>
    );
}
