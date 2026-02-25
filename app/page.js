import { supabase } from '@/lib/supabase';
import MenuList from '@/components/Home/MenuList';
import styles from './page.module.css';

async function getMenus(tableIdentifier) {
  // Strict: If no table hash provided, return no menus
  if (!tableIdentifier) {
    return [];
  }

  // If table identifier provided, first find the table strictly by hash
  const { data: tableData, error: tableError } = await supabase
    .from('tables')
    .select('id')
    .eq('table_hash', tableIdentifier)
    .eq('is_active', true)
    .single();

  if (tableError || !tableData) {
    console.error('Table not found or inactive:', tableError);
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
    .filter(m => m && m.is_active)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
}

export default async function Home({ searchParams }) {
  const resolvedParams = await searchParams;
  const tableParam = resolvedParams?.t;
  const menus = await getMenus(tableParam);

  return (
    <div className={styles.container}>
      <MenuList initialMenus={menus} />
    </div>
  );
}
