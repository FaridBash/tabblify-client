const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://cezbwhrknwzrmubmmucq.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlemJ3aHJrbnd6cm11Ym1tdWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTYzMzMsImV4cCI6MjA4ODU3MjMzM30.r1_rgsO6LQf2dZU5PpCWMkhb28HRzWT1AtDGKIP7E2Y'
);

async function check() {
    const { data, error } = await supabase.from('reservations').insert([{
        organization_id: 'ffd7675a-3bfc-4f50-a410-86dbc17b7c9d', // 'timon'
        table_id: '520a65f4-26d7-46b4-9956-5bb386d09684',
        customer_name: 'Test Client',
        customer_phone: '12345678',
        party_size: 2,
        reservation_date: '2026-03-20',
        start_time: '18:00:00',
        end_time: '19:30:00',
        customer_email: 'test@example.com',
        customer_age: 25
    }]).select();

    if (error) {
        console.error('Error Inserting:', error);
    } else {
        console.log('Successfully Inserted:', data);
    }
}

check();
