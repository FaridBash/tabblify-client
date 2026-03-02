import { supabase } from '@/lib/supabase';
import CategoryList from '@/components/Category/CategoryList';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

async function getCategories(menuId) {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('menu_id', menuId)
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
    return data;
}

async function getMenu(menuId) {
    const { data, error } = await supabase
        .from('menus')
        .select('*')
        .eq('id', menuId)
        .single();

    if (error) return null;
    return data;
}

export default async function CategoryPage({ params }) {
    const { menuId, tableId } = await params;
    const tableHash = tableId;

    // Strict Validation: Must have a table hash
    if (!tableHash) return <div className={styles.container}></div>;

    // Validate table exists and is active
    const { data: table, error: tableError } = await supabase
        .from('tables')
        .select('id')
        .eq('table_hash', tableHash)
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

    const categories = await getCategories(menuId);
    const menu = await getMenu(menuId);

    return (
        <div className={styles.container}>
            <CategoryList initialCategories={categories} menu={menu} />
        </div>
    );
}
