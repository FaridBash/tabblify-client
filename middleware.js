import { NextResponse } from 'next/server';

export function middleware(request) {
    const url = request.nextUrl;
    const pathname = url.pathname;

    // Ignore Next.js internals and APIs
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Determine if the path has a slug. The structure could be /slug or /slug/route
    const pathParts = pathname.split('/').filter(Boolean);
    const knownRoutes = ['menus', 'reserve', 'my-reservations', 'qr', 't'];

    if (pathParts.length > 0) {
        const potentialSlug = pathParts[0];

        // If the first part is NOT one of our known routes, assume it's an organization slug!
        if (!knownRoutes.includes(potentialSlug)) {
            // Yes, it's a slug!
            const requestHeaders = new Headers(request.headers);
            requestHeaders.set('x-organization-slug', potentialSlug);

            // Reconstruct path without the slug (e.g. /timon -> / or /timon/menus -> /menus)
            const remainingPath = '/' + pathParts.slice(1).join('/');
            
            // Rewrite the URL
            const rewriteUrl = new URL(remainingPath, request.url);
            
            const response = NextResponse.rewrite(rewriteUrl, {
                request: {
                    headers: requestHeaders,
                },
            });

            // Set cookie so future navigation to known routes remembers the slug
            response.cookies.set('org_slug', potentialSlug, { 
                path: '/',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7 // 1 week
            });

            return response;
        } else {
            // It IS a known route (like /menus). Let's check if we have a cookie for the slug
            const cookieSlug = request.cookies.get('org_slug')?.value;
            if (cookieSlug) {
                const requestHeaders = new Headers(request.headers);
                requestHeaders.set('x-organization-slug', cookieSlug);
                
                return NextResponse.next({
                    request: {
                        headers: requestHeaders,
                    },
                });
            }
        }
    } else {
        // Root path `/` without slug. Let's redirect to landing or check cookie?
        // Let's just pass it to layout, which might show landing or 404
        // If we want to remember their last restaurant, we could read cookie here too
        const cookieSlug = request.cookies.get('org_slug')?.value;
        if (cookieSlug) {
            const requestHeaders = new Headers(request.headers);
            requestHeaders.set('x-organization-slug', cookieSlug);
            
            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
