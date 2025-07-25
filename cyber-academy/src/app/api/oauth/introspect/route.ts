import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        let body;
        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            body = await request.json();
        } else {
            const txt = await request.text();
            const p = new URLSearchParams(txt);
            body = Object.fromEntries(p);
        }

        const { token } = body;

        if (!token) {
            return NextResponse.json({ active: false });
        }

        // SIMULATION: In a real system, we would look up the token in a DB.
        // Here we just check the prefix.
        const isValid = token.startsWith('atk_');

        if (isValid) {
            return NextResponse.json({
                active: true,
                scope: 'files.read photos.view openid', // Simulated scopes for the demo token
                client_id: 'pixel-print-app',
                username: 'alice',
                exp: Math.floor(Date.now() / 1000) + 3600
            });
        } else {
            return NextResponse.json({ active: false });
        }

    } catch (e: any) {
        return NextResponse.json({ error: 'server_error', details: e.message }, { status: 500 });
    }
}
