const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://cezbwhrknwzrmubmmucq.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlemJ3aHJrbnd6cm11Ym1tdWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTYzMzMsImV4cCI6MjA4ODU3MjMzM30.r1_rgsO6LQf2dZU5PpCWMkhb28HRzWT1AtDGKIP7E2Y'
);

async function check() {
    const orgId = '8239f195-a748-4389-937a-bc1d2ab60c0b'; // 'grand'

    console.log('Checking ui_config for orgId:', orgId);
    const { data, error, count } = await supabase
        .from('ui_config')
        .select('*', { count: 'exact' })
        .eq('organization_id', orgId);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Rows found:', data.length);
        console.log('Data:', data);
    }
}

check();
