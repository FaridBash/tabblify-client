import { supabase } from '@/lib/supabase';
import MenuList from '@/components/Home/MenuList';
import styles from './page.module.css';
import { getOrganization } from '@/lib/org';
import RootRedirect from '@/components/Home/RootRedirect';

async function getMenus(tableIdentifier, organizationId) {
  // Strict: If no table hash provided or organization not identified, return no menus
  if (!tableIdentifier || !organizationId) {
    return [];
  }

  // If table identifier provided, first find the table strictly by hash and organization
  const { data: tableData, error: tableError } = await supabase
    .from('tables')
    .select('id')
    .eq('table_hash', tableIdentifier)
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .single();

  if (tableError || !tableData) {
    console.error('Table not found or inactive for this organization:', tableError);
    return []; // Strict filtering: if table provided but not found, show nothing
  }

  // Then fetch menus assigned to this table
  const { data: assignments, error: assignmentsError } = await supabase
    .from('table_menu_assignments')
    .select(`
      menus (*)
    `)
    .eq('table_id', tableData.id);

  if (assignmentsError) {
    console.error('Error fetching assigned menus:', assignmentsError);
    return [];
  }

  // Extract menus from join result and filter active ones
  return assignments
    .map(a => a.menus)
    .filter(m => m && m.is_active && m.organization_id === organizationId)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
}

export default async function Home({ params }) {
  const resolvedParams = await params;
  const tableParam = resolvedParams?.tableId;
  const organization = await getOrganization();
  
  const hasEMenu = organization?.features?.includes('emenu');

  if (!hasEMenu) {
      return <RootRedirect />;
  }

  const menus = await getMenus(tableParam, organization?.id);

  return (
    <div className={styles.container}>
      <MenuList initialMenus={menus} />
    </div>
  );
}
