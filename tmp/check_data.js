const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://cezbwhrknwzrmubmmucq.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlemJ3aHJrbnd6cm11Ym1tdWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTYzMzMsImV4cCI6MjA4ODU3MjMzM30.r1_rgsO6LQf2dZU5PpCWMkhb28HRzWT1AtDGKIP7E2Y'
);

async function check() {
    const { data: config } = await supabase.from('ui_config').select('organization_id').limit(5);
    console.log('UI configs exist for org IDs:', config.map(c => c.organization_id));

    const { data: categories } = await supabase.from('categories').select('organization_id').limit(5);
    console.log('Categories exist for org IDs:', categories.map(c => c.organization_id));
}

check();
