import { supabase } from '@/lib/supabase';
import ReservationFlow from '@/components/Reservation/ReservationFlow';

async function getReservationData() {
    try {
        const [layoutRes, settingsRes, hoursRes, closuresRes] = await Promise.all([
            supabase.from('restaurant_layouts').select('*').eq('is_active', true).single(),
            supabase.from('reservation_settings').select('*').limit(1).single(),
            supabase.from('reservation_hours').select('*').order('day_of_week'),
            supabase.from('special_closures').select('*'),
        ]);

        return {
            layout: layoutRes.data,
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
    const data = await getReservationData();

    return <ReservationFlow initialData={data} />;
}
