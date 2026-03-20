import { NextResponse } from 'next/server';

export function middleware(request) {
    const url = request.nextUrl;
    const pathname = url.pathname;

    // Ignore Next.js internals and static files
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Organization is now resolved via subdomain in lib/org.js
    // No path-based slug rewriting needed
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
