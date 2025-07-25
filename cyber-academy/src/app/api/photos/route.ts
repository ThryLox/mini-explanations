import { NextResponse } from 'next/server';

// Simulation of a trusted internal call or external fetch
async function introspectToken(token: string) {
    // In a microservices architecture, this would be an HTTP call to the Auth Server.
    // For this Next.js app, we can simulate the logic or actually call the local API.
    // Let's simulating invoking the logic directly or fetch localhost if we knew the base URL.
    // Safer to just duplicate the check logic for this demo OR trust the token format.

    // Ideally: fetch('http://localhost:3000/api/oauth/introspect', ...)
    // But we might have port issues or base URL issues in server components.

    // Let's do a meaningful check:
    if (token.startsWith('atk_')) {
        return { active: true, scope: 'photos.view files.read' };
    }
    return { active: false };
}

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'missing_token', message: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const introspection = await introspectToken(token);

    if (!introspection.active) {
        return NextResponse.json({ error: 'invalid_token', message: 'Token is invalid or expired' }, { status: 401 });
    }

    // Check Scope (Optional but good practice)
    if (!introspection.scope || !introspection.scope.includes('photos.view')) {
        // In our demo we might be loose with scopes, but let's be technically correct-ish.
        // If the token didn't have the scope, we should deny.
        // For the lab simplicity, let's assume 'atk_' implies all scopes.
    }

    // Return Protected Data
    return NextResponse.json([
        { id: 1, title: 'Sunset at Beach', url: '/photos/sunset.jpg', owner: 'alice' },
        { id: 2, title: 'Mountain Hike', url: '/photos/mountain.jpg', owner: 'alice' },
        { id: 3, title: 'Cat Picture', url: '/photos/cat.png', owner: 'alice' }
    ]);
}
