import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

declare global {
  var _oauthCodes: Map<string, any>;
}
if (!global._oauthCodes) global._oauthCodes = new Map();
const codes = global._oauthCodes;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const responseType = searchParams.get('response_type');
  const scope = searchParams.get('scope');
  const state = searchParams.get('state');
  const codeChallenge = searchParams.get('code_challenge');

  // 1. Basic Validation
  if (!clientId || !redirectUri || !codeChallenge) {
    return NextResponse.json({ error: 'invalid_request', desc: 'Missing required parameters' }, { status: 400 });
  }

  if (responseType !== 'code') {
     return NextResponse.json({ error: 'unsupported_response_type', desc: 'Only response_type=code is supported' }, { status: 400 });
  }

  // 2. Check Session (Simulated)
  const cookieStore = await cookies();
  const session = cookieStore.get('auth_user');

  if (!session) {
    // Redirect to Login
    const loginUrl = new URL('/modules/oauth/server/login', request.url);
    loginUrl.searchParams.set('returnTo', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Redirect to Consent
  // In a real app, we'd check if consent was already given. Here, always ask.
  const consentUrl = new URL('/modules/oauth/server/consent', request.url);
  // Pass all original params to consent page so it can post them back
  searchParams.forEach((value, key) => {
    consentUrl.searchParams.set(key, value);
  });
  
  return NextResponse.redirect(consentUrl);
}

export async function POST(request: Request) {
  // Handle the Approval from Consent Page
  try {
    const body = await request.json();
    const { client_id, redirect_uri, scope, state, code_challenge, decision } = body;

    if (decision !== 'allow') {
       const errorUrl = new URL(redirect_uri);
       errorUrl.searchParams.set('error', 'access_denied');
       if (state) errorUrl.searchParams.set('state', state);
       return NextResponse.json({ redirect: errorUrl.toString() });
    }

    // Generate Code
    const code = crypto.randomBytes(16).toString('hex');
    
    // Store Code (expires in 5 mins) -> In memory for demo
    codes.set(code, {
      client_id,
      redirect_uri,
      scope,
      code_challenge,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    // Build Redirect URL
    const callbackUrl = new URL(redirect_uri);
    callbackUrl.searchParams.set('code', code);
    if (state) callbackUrl.searchParams.set('state', state);

    return NextResponse.json({ redirect: callbackUrl.toString() });

  } catch (e: any) {
    return NextResponse.json({ error: 'server_error', details: e.message }, { status: 500 });
  }
}
