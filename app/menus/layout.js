import { getOrganization } from '@/lib/org';
import RootRedirect from '@/components/Home/RootRedirect';

export default async function TableMenuLayout({ children }) {
    const organization = await getOrganization();
    
    if (!organization) {
        return null;
    }

    if (!organization.features?.includes('emenu')) {
        return <RootRedirect />;
    }

    return children;
}
