const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://cezbwhrknwzrmubmmucq.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlemJ3aHJrbnd6cm11Ym1tdWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTYzMzMsImV4cCI6MjA4ODU3MjMzM30.r1_rgsO6LQf2dZU5PpCWMkhb28HRzWT1AtDGKIP7E2Y'
);

async function check() {
    const orgId = 'ffd7675a-3bfc-4f50-a410-86dbc17b7c9d'; // 'timon'
    console.log(`--- Checking ANON Data for Timon (${orgId}) ---`);

    const { data: settings } = await supabase.from('reservation_settings').select('*').eq('organization_id', orgId);
    console.log('Settings Found (ANON):', settings?.length || 0);

    const { data: hours } = await supabase.from('reservation_hours').select('*').eq('organization_id', orgId);
    console.log('Hours Found (ANON):', hours?.length || 0);

    const { data: layouts } = await supabase.from('restaurant_layouts').select('*').eq('organization_id', orgId);
    console.log('Layouts Found (ANON):', layouts?.length || 0);
}

check();
