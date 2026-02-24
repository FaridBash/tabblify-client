import { supabase } from '@/lib/supabase';
import ItemList from '@/components/Items/ItemList';
import styles from './page.module.css';

async function getItems(categoryId) {
    const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true);

    if (error) {
        console.error('Error fetching items:', error);
        return [];
    }
    return data;
}

async function getCategory(categoryId) {
    const { data, error } = await supabase
        .from('categories')
        .select('*, menus(*)')
        .eq('id', categoryId)
        .single();

    if (error) return null;
    return data;
}

export default async function ItemsPage({ params }) {
    const { menuId, categoryId } = await params;
    const items = await getItems(categoryId);
    const category = await getCategory(categoryId);

    return (
        <div className={styles.container}>
            <ItemList initialItems={items} category={category} />
        </div>
    );
}
