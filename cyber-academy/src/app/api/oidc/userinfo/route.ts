import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Validate token (Simulated)
    if (!token.startsWith('atk_')) {
        return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
    }

    // Return static user info for Alice
    return NextResponse.json({
        sub: 'alice-123',
        name: 'Alice Wonderland',
        preferred_username: 'alice',
        email: 'alice@example.com',
        email_verified: true,
        zoneinfo: 'America/Los_Angeles',
        updated_at: Math.floor(Date.now() / 1000)
    });
}

export async function POST(request: Request) {
    return GET(request);
}
