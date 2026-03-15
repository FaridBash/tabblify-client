import { supabase } from '@/lib/supabase';
import CategoryList from '@/components/Category/CategoryList';
import styles from './page.module.css';
import { getOrganization } from '@/lib/org';

export const dynamic = 'force-dynamic';

async function getCategories(menuId, organizationId) {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('menu_id', menuId)
        .eq('organization_id', organizationId)
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
    return data;
}

async function getMenu(menuId, organizationId) {
    const { data, error } = await supabase
        .from('menus')
        .select('*')
        .eq('id', menuId)
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .single();

    if (error) return null;
    return data;
}

export default async function PublicMenuPage({ params }) {
    const { menuId } = await params;
    const organization = await getOrganization();

    if (!organization) return <div className={styles.container} />;

    const menu = await getMenu(menuId, organization.id);
    if (!menu) return <div className={styles.container} />;

    const categories = await getCategories(menuId, organization.id);

    const orgSlugPrefix = organization?.slug ? `/${organization.slug}` : '';

    return (
        <div className={styles.container}>
            <CategoryList initialCategories={categories} menu={menu} basePath={`${orgSlugPrefix}/menus/${menuId}`} />
        </div>
    );
}
