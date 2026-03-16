import { supabase } from '@/lib/supabase';
import ReservationFlow from '@/components/Reservation/ReservationFlow';
import { getOrganization } from '@/lib/org';
import { redirect } from 'next/navigation';

async function getReservationData(organizationId) {
    if (!organizationId) return { layout: null, settings: null, hours: [], closures: [] };

    try {
        const [layoutsRes, settingsRes, hoursRes, closuresRes] = await Promise.all([
            supabase.from('restaurant_layouts').select('*').eq('organization_id', organizationId).eq('is_active', true).order('name', { ascending: true }),
            supabase.from('reservation_settings').select('*').eq('organization_id', organizationId).maybeSingle(),
            supabase.from('reservation_hours').select('*').eq('organization_id', organizationId).order('day_of_week'),
            supabase.from('special_closures').select('*').eq('organization_id', organizationId),
        ]);

        return {
            layouts: layoutsRes.data || [],
            settings: settingsRes.data,
            hours: hoursRes.data || [],
            closures: closuresRes.data || [],
        };
    } catch (error) {
        console.error('Error fetching reservation data:', error);
        return { layout: null, settings: null, hours: [], closures: [] };
    }
}

export default async function ReservePage() {
    const organization = await getOrganization();
    
    if (organization && !organization.features?.includes('reservations')) {
        redirect('/');
    }

    const data = await getReservationData(organization?.id);

    return <ReservationFlow initialData={data} />;
}
