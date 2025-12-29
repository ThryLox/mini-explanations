import { NextResponse } from 'next/server';
import crypto from 'crypto';

declare global {
  var _oauthCodes: Map<string, any>;
}
if (!global._oauthCodes) global._oauthCodes = new Map();
const codes = global._oauthCodes;

export async function POST(request: Request) {
  try {
    // Fallback if body is empty?
    let body;
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      // Handle x-www-form-urlencoded
      const txt = await request.text();
      const p = new URLSearchParams(txt);
      body = Object.fromEntries(p);
    }

    const { grant_type, code, code_verifier } = body;

    // 1. Basic Checks
    if (grant_type !== 'authorization_code') {
      return NextResponse.json({ error: 'unsupported_grant_type' }, { status: 400 });
    }

    if (!code || !code_verifier) {
      return NextResponse.json({ error: 'invalid_request', desc: 'Missing code or code_verifier' }, { status: 400 });
    }

    // 2. Lookup Code
    const data = codes.get(code);
    if (!data) {
      return NextResponse.json({ error: 'invalid_grant', desc: 'Code not found or expired' }, { status: 400 });
    }

    // 3. Verify PKCE
    const hash = crypto.createHash('sha256').update(code_verifier).digest('base64')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    if (hash !== data.code_challenge) {
      return NextResponse.json({ error: 'invalid_grant', desc: 'PKCE verification failed' }, { status: 400 });
    }

    // 4. Burn Code
    codes.delete(code);

    // 5. Issue Access Token
    const access_token = 'atk_' + crypto.randomBytes(16).toString('hex');

    return NextResponse.json({
      access_token,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: data.scope,
    });

  } catch (e: any) {
    console.error('Token Endpoint Error:', e);
    return NextResponse.json({ error: 'server_error', details: e.message }, { status: 500 });
  }
}
