const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://cezbwhrknwzrmubmmucq.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlemJ3aHJrbnd6cm11Ym1tdWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTYzMzMsImV4cCI6MjA4ODU3MjMzM30.r1_rgsO6LQf2dZU5PpCWMkhb28HRzWT1AtDGKIP7E2Y'
);

async function check() {
    const orgId = '8239f195-a748-4389-937a-bc1d2ab60c0b'; // 'grand'

    console.log('Testing access as ANON for orgId:', orgId);
    const { data: menus, error: menusError } = await supabase.from('menus').select('*').eq('organization_id', orgId);
    console.log('Menus found:', menus?.length || 0);

    const { data: config, error: configError } = await supabase.from('ui_config').select('*').eq('organization_id', orgId);
    console.log('UI Config found:', config?.length || 0);

    const { data: categories, error: catError } = await supabase.from('categories').select('*').eq('organization_id', orgId);
    console.log('Categories found:', categories?.length || 0);
}

check();
