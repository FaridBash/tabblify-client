import { supabase } from '@/lib/supabase';
import CategoryList from '@/components/Category/CategoryList';
import styles from './page.module.css';

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
    const { menuId } = await params;
    const categories = await getCategories(menuId);
    const menu = await getMenu(menuId);

    return (
        <div className={styles.container}>
            <CategoryList initialCategories={categories} menu={menu} />
        </div>
    );
}
