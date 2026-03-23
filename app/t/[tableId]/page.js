import { supabase } from '@/lib/supabase';
import TableReservationManager from '@/components/Home/TableReservationManager';
import styles from './page.module.css';
import { getOrganization } from '@/lib/org';
import RootRedirect from '@/components/Home/RootRedirect';

async function getTableContent(tableIdentifier, organizationId) {
  // Strict: If no table hash provided or organization not identified, return empty
  if (!tableIdentifier || !organizationId || !supabase) {
    return { menus: [], reservations: [] };
  }

  // Find table
  const { data: tableData, error: tableError } = await supabase
    .from('tables')
    .select('id')
    .eq('table_hash', tableIdentifier)
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .single();

  if (tableError || !tableData) {
    console.error('Table not found or inactive for this organization:', tableError);
    return { menus: [], reservations: [] };
  }

  // Fetch menus assigned to this table
  const { data: assignments } = await supabase
    .from('table_menu_assignments')
    .select(`menus (*)`)
    .eq('table_id', tableData.id);

  const menus = (assignments || [])
    .map(a => a.menus)
    .filter(m => m && m.is_active && m.organization_id === organizationId)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  // Get date range (Today +/- 1 day) to handle server/local timezone mismatch for server fetch
  const now = new Date();
  const today = new Date(now.getTime());
  const yesterday = new Date(now.getTime() - 86400000);
  const tomorrow = new Date(now.getTime() + 86400000);

  const dateList = [
      yesterday.toLocaleDateString('en-CA'),
      today.toLocaleDateString('en-CA'),
      tomorrow.toLocaleDateString('en-CA')
  ];

  const { data: reservations } = await supabase
    .from('reservations')
    .select('*')
    .eq('table_id', tableData.id)
    .eq('organization_id', organizationId)
    .in('reservation_date', dateList)
    .not('status', 'eq', 'cancelled');

  return { menus, reservations: reservations || [] };
}

export default async function Home({ params }) {
  const resolvedParams = await params;
  const tableParam = resolvedParams?.tableId;
  const organization = await getOrganization();
  
  const hasEMenu = organization?.features?.includes('emenu');

  if (!hasEMenu) {
      return <RootRedirect />;
  }

  const { menus, reservations } = await getTableContent(tableParam, organization?.id);

  return (
    <div className={styles.container}>
      <TableReservationManager 
          initialMenus={menus} 
          reservations={reservations} 
      />
    </div>
  );
}
