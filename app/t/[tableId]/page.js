import { supabase } from '@/lib/supabase';
import MenuLanding from '@/components/Home/MenuLanding';
import TablePopup from '@/components/Home/TablePopup';
import styles from './page.module.css';
import { getOrganization } from '@/lib/org';
import RootRedirect from '@/components/Home/RootRedirect';

async function getTableData(tableIdentifier, organizationId) {
  // Strict: If no table hash provided or organization not identified, return empty
  if (!tableIdentifier || !organizationId || !supabase) {
    return { menus: [], reservation: null };
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
    return { menus: [], reservation: null };
  }

  // Fetch menus assigned to this table
  const { data: assignments, error: assignmentsError } = await supabase
    .from('table_menu_assignments')
    .select(`menus (*)`)
    .eq('table_id', tableData.id);

  const menus = (assignments || [])
    .map(a => a.menus)
    .filter(m => m && m.is_active && m.organization_id === organizationId)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  // Get current local date/time in YYYY-MM-DD and HH:mm:ss format
  // en-CA or sv often gives YYYY-MM-DD. en-GB gives 24h HH:mm:ss
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-CA'); 
  const timeStr = now.toLocaleTimeString('en-GB');

  console.log(`[Table Flow] Checking table ${tableIdentifier} at ${dateStr} ${timeStr}`);

  const { data: reservations, error: resFetchError } = await supabase
    .from('reservations')
    .select('*')
    .eq('table_id', tableData.id)
    .eq('organization_id', organizationId)
    .eq('reservation_date', dateStr)
    .not('status', 'eq', 'cancelled');

  if (resFetchError) {
    console.error('[Table Flow] Error fetching reservations:', resFetchError);
  }

  let activeReservation = null;
  if (reservations && reservations.length > 0) {
    activeReservation = reservations.find(r => {
      if (r.start_time && r.end_time) {
        // Simple string comparison works for HH:mm:ss
        return timeStr >= r.start_time && timeStr <= r.end_time;
      }
      return false;
    });

    if (activeReservation) {
      console.log(`[Table Flow] SUCCESS: Active Reservation found for ${activeReservation.customer_name}`);
    } else {
      console.log(`[Table Flow] Found ${reservations.length} reservations today, but none active at ${timeStr}`);
    }
  }

  return { menus, reservation: activeReservation || null };
}

export default async function Home({ params }) {
  const resolvedParams = await params;
  const tableParam = resolvedParams?.tableId;
  const organization = await getOrganization();
  
  const hasEMenu = organization?.features?.includes('emenu');

  if (!hasEMenu) {
      return <RootRedirect />;
  }

  const { menus, reservation } = await getTableData(tableParam, organization?.id);

  return (
    <div className={styles.container}>
      {reservation && reservation.popup_enabled && (
          <TablePopup reservation={reservation} />
      )}
      <MenuLanding 
        initialMenus={menus} 
        title={reservation?.page_title_text || undefined}
        subtitle={reservation?.page_subtitle_text || undefined}
        footer={reservation?.page_footer_text || undefined}
      />
    </div>
  );
}
