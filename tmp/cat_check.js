const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
    'https://cezbwhrknwzrmubmmucq.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlemJ3aHJrbnd6cm11Ym1tdWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTYzMzMsImV4cCI6MjA4ODU3MjMzM30.r1_rgsO6LQf2dZU5PpCWMkhb28HRzWT1AtDGKIP7E2Y'
);

async function check() {
    const { data: cat } = await supabase.from('categories').select('*');
    console.log('ANY Categories globally reachable:', cat?.length || 0);

    const { data: items } = await supabase.from('items').select('*');
    console.log('ANY Items globally reachable:', items?.length || 0);
}

check();
