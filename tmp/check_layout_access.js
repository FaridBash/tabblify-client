const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://cezbwhrknwzrmubmmucq.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlemJ3aHJrbnd6cm11Ym1tdWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTYzMzMsImV4cCI6MjA4ODU3MjMzM30.r1_rgsO6LQf2dZU5PpCWMkhb28HRzWT1AtDGKIP7E2Y'
);

async function check() {
    const orgId = 'ffd7675a-3bfc-4f50-a410-86dbc17b7c9d'; // 'timon'
    console.log(`--- Checking Layout Data for Timon (${orgId}) as ANON ---`);

    const { data: layouts, error } = await supabase
        .from('restaurant_layouts')
        .select('id, name, is_active, organization_id')
        .eq('organization_id', orgId);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Layouts Found:', layouts);
    }
}

check();
