import { supabase } from '@/lib/supabase';
import ItemList from '@/components/Items/ItemList';
import styles from './page.module.css';
import { getOrganization } from '@/lib/org';

export const dynamic = 'force-dynamic';

async function getItems(categoryId, organizationId) {
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
    const { data, error } = await supabase
        .from('categories')
        .select('*, menus(*)')
        .eq('id', categoryId)
        .eq('organization_id', organizationId)
        .single();

    if (error) return null;
    return data;
}

export default async function ItemsPage({ params }) {
    const { menuId, categoryId, tableId } = await params;
    const organization = await getOrganization();
    const tableHash = tableId;

    // Strict Validation: Must have a table hash and organization
    if (!tableHash || !organization) return <div className={styles.container}></div>;

    // Validate table exists, is active and belongs to this organization
    const { data: table, error: tableError } = await supabase
        .from('tables')
        .select('id')
        .eq('table_hash', tableHash)
        .eq('organization_id', organization.id)
        .eq('is_active', true)
        .single();

    if (tableError || !table) return <div className={styles.container}></div>;

    // Validate menu is assigned to this table
    const { data: assignment, error: assignmentError } = await supabase
        .from('table_menu_assignments')
        .select('*')
        .eq('table_id', table.id)
        .eq('menu_id', menuId)
        .single();

    if (assignmentError || !assignment) return <div className={styles.container}></div>;

    const items = await getItems(categoryId, organization.id);
    const category = await getCategory(categoryId, organization.id);

    return (
        <div className={styles.container}>
            <ItemList initialItems={items} category={category} />
        </div>
    );
}
