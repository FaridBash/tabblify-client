const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://cezbwhrknwzrmubmmucq.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlemJ3aHJrbnd6cm11Ym1tdWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTYzMzMsImV4cCI6MjA4ODU3MjMzM30.r1_rgsO6LQf2dZU5PpCWMkhb28HRzWT1AtDGKIP7E2Y'
);

async function check() {
    const orgs = [
        { name: 'default-slug-ec33fc', id: '00000000-0000-0000-0000-000000000000' },
        { name: 'testing', id: '1e23c428-e676-4298-8a50-d742bf0aadbe' },
        { name: 'grand', id: '8239f195-a748-4389-937a-bc1d2ab60c0b' }
    ];

    for (const org of orgs) {
        console.log(`--- Checking Org: ${org.name} (${org.id}) ---`);
        const { data: config } = await supabase.from('ui_config').select('*').eq('organization_id', org.id);
        console.log(`UI Config rows: ${config?.length || 0}`);
        if (config?.length > 0) {
            console.log('Sample Config:', config[0]);
        }
    }
}

check();
