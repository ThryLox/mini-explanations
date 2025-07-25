'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// --- HELPERS (Crypto & JWT) ---
async function generatePKCE() {
    const codeVerifier = arrayBufferToBase64(crypto.getRandomValues(new Uint8Array(32)).buffer)
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const codeChallenge = arrayBufferToBase64(hash)
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    return { codeVerifier, codeChallenge };
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function decodeJwt(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return { error: 'Failed to decode JWT' };
    }
}

// --- WIZARD COMPONENTS ---
function StepCard({ title, children, isActive, isCompleted }: { title: string, children: React.ReactNode, isActive: boolean, isCompleted: boolean }) {
    if (!isActive && !isCompleted) return (
        <div className="relative pl-8 pb-12 opacity-40 grayscale transition-all duration-500">
            <div className="absolute left-0 top-0 w-6 h-6 rounded-full border-2 border-slate-700 bg-[#0f172a] z-10 flex items-center justify-center text-[10px] font-bold text-slate-500 mb-2"></div>
            <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-slate-800"></div>
            <h3 className="text-lg font-bold text-slate-500 mb-2">{title}</h3>
        </div>
    );

    return (
        <div className="relative pl-8 pb-12 transition-all duration-500">
            {/* Timeline Dot & Line */}
            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-[3px] z-10 flex items-center justify-center transition-colors
                ${isCompleted ? 'border-green-500 bg-green-500' : 'border-blue-500 bg-[#0f172a] shadow-[0_0_15px_rgba(59,130,246,0.5)]'}
            `}>
                {isCompleted && <span className="text-black text-[10px] font-bold">✓</span>}
            </div>
            <div className={`absolute left-[11px] top-7 bottom-0 w-[2px] transition-colors ${isCompleted ? 'bg-green-500/30' : 'bg-slate-800'}`}></div>

            <div className={`p-6 rounded-2xl border transition-all duration-300
                ${isActive
                    ? 'bg-slate-800/50 border-blue-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-sm'
                    : 'bg-green-900/10 border-green-500/20'
                }
            `}>
                <h3 className={`text-xl font-bold mb-4 flex items-center gap-3 ${isActive ? 'text-white' : 'text-green-400'}`}>
                    {title}
                    {isCompleted && <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 border border-green-500/30">Done</span>}
                </h3>

                <div className={`space-y-4 ${isCompleted ? 'hidden' : 'block'}`}>
                    {children}
                </div>
            </div>
        </div>
    );
}

function LabContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const mode = searchParams.get('mode') || 'oauth';

    // State
    const [step, setStep] = useState(0);
    const [config, setConfig] = useState({
        clientId: 'pixel-print-app',
        scopes: mode === 'oidc' ? 'openid profile files.read' : 'files.read photos.view',
        redirectUri: '',
    });
    const [pkce, setPkce] = useState<{ verifier: string, challenge: string } | null>(null);
    const [oauthState] = useState('random_state_' + Math.floor(Math.random() * 10000));

    // Result State
    const [authCode, setAuthCode] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [idToken, setIdToken] = useState<string | null>(null);
    const [parsedIdToken, setParsedIdToken] = useState<any>(null);
    const [userInfo, setUserInfo] = useState<any | null>(null);
    const [photos, setPhotos] = useState<any[] | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined' && !config.redirectUri) {
            const url = new URL(window.location.href);
            // Clear existing params but keep mode if present
            const newParams = new URLSearchParams();
            if (mode === 'oidc') {
                newParams.set('mode', 'oidc');
            }
            url.search = newParams.toString();

            setConfig(prev => ({ ...prev, redirectUri: url.toString() }));
        }
    }, [mode, config.redirectUri]);

    useEffect(() => {
        const code = searchParams.get('code');
        if (code) {
            setAuthCode(code);
            setStep(2);
            const savedVerifier = sessionStorage.getItem('pkce_verifier');
            if (savedVerifier) setPkce(prev => prev ? prev : { verifier: savedVerifier, challenge: '(restored from session)' });
        }
    }, [searchParams]);

    const addLog = (msg: string) => setLogs(prev => [`> ${msg}`, ...prev]);

    // --- ACTIONS ---

    const generateKeys = async () => {
        const keys = await generatePKCE();
        setPkce({ verifier: keys.codeVerifier, challenge: keys.codeChallenge });
        sessionStorage.setItem('pkce_verifier', keys.codeVerifier);
        addLog('Generated PKCE Keys.');
        setStep(1);
    };

    const goToAuthServer = () => {
        if (!pkce) return;
        const authUrl = new URL('/api/oauth/authorize', window.location.origin);
        authUrl.searchParams.set('client_id', config.clientId);
        authUrl.searchParams.set('redirect_uri', config.redirectUri);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', config.scopes);
        authUrl.searchParams.set('code_challenge', pkce.challenge);
        authUrl.searchParams.set('code_challenge_method', 'S256');
        authUrl.searchParams.set('state', oauthState);
        if (config.scopes.includes('openid')) {
            authUrl.searchParams.set('nonce', 'demo_nonce');
        }

        addLog(`Redirecting to Auth Server...`);
        window.location.href = authUrl.toString();
    };

    const exchangeCode = async () => {
        if (!authCode || !pkce) return;
        addLog('Exchanging Code for Token...');

        try {
            const isOidc = config.scopes.includes('openid');
            const endpoint = isOidc ? '/api/oidc/token' : '/api/oauth/token';

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grant_type: 'authorization_code',
                    code: authCode,
                    redirect_uri: config.redirectUri,
                    client_id: config.clientId,
                    code_verifier: pkce.verifier
                })
            });
            const data = await res.json();

            if (res.ok) {
                setAccessToken(data.access_token);
                if (data.id_token) {
                    setIdToken(data.id_token);
                    setParsedIdToken(decodeJwt(data.id_token));
                }
                setStep(3);
                addLog('Token Exchange Successful!');
            } else {
                addLog(`Error: ${data.error}`);
            }
        } catch (e: any) {
            addLog(`Network Error: ${e.message}`);
        }
    };

    const fetchPhotos = async () => {
        if (!accessToken) return;
        addLog('Fetching Photos...');
        try {
            const res = await fetch('/api/photos', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const data = await res.json();
            if (res.ok) {
                setPhotos(data);
                addLog(`Fetched ${data.length} photos.`);
            } else {
                addLog('Failed to fetch photos.');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchUserProfile = async () => {
        if (!accessToken) return;
        addLog('Fetching User Info calling /api/oidc/userinfo...');
        try {
            const res = await fetch('/api/oidc/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const data = await res.json();
            if (res.ok) {
                setUserInfo(data);
                addLog(`Fetched User Profile for ${data.name || 'User'}.`);
            } else {
                addLog('Failed to fetch user info.');
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white">
            <div className="max-w-[1400px] mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-12 h-screen overflow-hidden">

                {/* COLUMN 1: WIZARD */}
                <div className="lg:col-span-2 overflow-y-auto pr-4 custom-scrollbar">
                    <div className="mb-10 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">{mode === 'oidc' ? '🆔' : '🔑'}</span>
                                <h1 className="text-3xl font-black tracking-tight">{mode === 'oidc' ? 'OIDC Lab' : 'OAuth Lab'}</h1>
                            </div>
                            <p className="text-slate-400">Follow the timeline to complete the secure flow.</p>
                        </div>
                        <button onClick={() => router.push('/')} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-800 transition">Exit Lab</button>
                    </div>

                    <div className="pl-4">
                        {/* Step 1: Prep */}
                        <StepCard title="Step 1: Preparation" isActive={step === 0} isCompleted={step > 0}>
                            <p className="text-sm text-slate-300 mb-4">
                                The Client needs to generate a high-entropy secret (PKCE) before talking to the server.
                            </p>
                            <div className="bg-black/30 p-4 rounded-xl border border-white/5 mb-4">
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Requested Scopes</label>
                                <input
                                    value={config.scopes}
                                    onChange={e => setConfig({ ...config, scopes: e.target.value })}
                                    className="w-full bg-transparent text-white font-mono text-sm border-b border-white/10 focus:border-blue-500 outline-none py-1"
                                />
                            </div>
                            <button onClick={generateKeys} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
                                Generate Keys
                            </button>
                        </StepCard>

                        {/* Step 2: Auth Request */}
                        <StepCard title="Step 2: User Authorization" isActive={step === 1} isCompleted={step > 1}>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Verifier (Secret)</div>
                                    <code className="text-xs break-all text-blue-400 font-mono">{pkce?.verifier}</code>
                                </div>
                                <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Challenge (Public)</div>
                                    <code className="text-xs break-all text-green-400 font-mono">{pkce?.challenge}</code>
                                </div>
                            </div>
                            <p className="text-sm text-slate-300 mb-4">Redirect user to Auth Server to login and consent.</p>
                            <button onClick={goToAuthServer} className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition">
                                Go to Auth Server &rarr;
                            </button>
                        </StepCard>

                        {/* Step 3: Exchange */}
                        <StepCard title="Step 3: Code Exchange" isActive={step === 2} isCompleted={step > 2}>
                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl mb-4">
                                <h4 className="font-bold text-yellow-400 text-xs uppercase mb-2">🎟️ One-Time Code</h4>
                                <code className="text-sm break-all font-mono text-yellow-200">{authCode}</code>
                            </div>
                            <button onClick={exchangeCode} className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition shadow-[0_4px_12px_rgba(16,185,129,0.3)]">
                                Exchange for Token
                            </button>
                        </StepCard>

                        {/* Step 4: Use Token */}
                        <StepCard title={mode === 'oidc' ? "Step 4: Verify Identity" : "Step 4: Resource Access"} isActive={step === 3} isCompleted={false}>
                            <div className="space-y-4 mb-6">
                                <div className="bg-slate-900 border border-white/10 p-4 rounded-xl font-mono text-xs overflow-x-auto">
                                    <div className="mb-2 text-slate-400 uppercase font-bold text-[10px]">Access Token</div>
                                    <span className="text-green-400 break-all">{accessToken}</span>
                                </div>
                                {parsedIdToken && (
                                    <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-xl font-mono text-xs">
                                        <div className="mb-2 text-purple-400 uppercase font-bold text-[10px]">ID Token Payload</div>
                                        <pre className="text-purple-200 whitespace-pre-wrap">{JSON.stringify(parsedIdToken, null, 2)}</pre>
                                    </div>
                                )}
                            </div>

                            {/* OIDC MODE: Fetch User Info */}
                            {mode === 'oidc' && (
                                <>
                                    {!userInfo && (
                                        <button onClick={fetchUserProfile} className="w-full py-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-200 rounded-xl font-bold transition flex items-center justify-center gap-2">
                                            <span>👤</span> Fetch User Profile
                                        </button>
                                    )}
                                    {userInfo && (
                                        <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <h4 className="font-bold text-purple-300 text-sm mb-3">Authenticated User Profile</h4>
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-xl">
                                                    {userInfo.picture ? <img src={userInfo.picture} alt="Profile" className="rounded-full" /> : '👤'}
                                                </div>
                                                <div>
                                                    <div className="text-white font-bold">{userInfo.name}</div>
                                                    <div className="text-purple-300 text-xs">{userInfo.email}</div>
                                                </div>
                                            </div>
                                            <pre className="mt-2 text-[10px] text-purple-200/50 bg-black/30 p-2 rounded-lg break-all whitespace-pre-wrap">
                                                {JSON.stringify(userInfo, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* OAUTH MODE: Fetch Photos */}
                            {mode !== 'oidc' && (
                                <>
                                    {!photos && (
                                        <button onClick={fetchPhotos} className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold transition flex items-center justify-center gap-2">
                                            <span>📸</span> Fetch Protected Photos
                                        </button>
                                    )}

                                    {photos && (
                                        <div className="grid grid-cols-3 gap-4 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            {photos.map(p => (
                                                <div key={p.id} className="bg-white/5 p-2 rounded-xl border border-white/10">
                                                    <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg mb-2 relative overflow-hidden group">
                                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    </div>
                                                    <p className="text-xs font-bold text-center text-slate-300">{p.title}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </StepCard>
                    </div>
                </div>

                {/* COLUMN 2: LOGS & INFO */}
                <div className="col-span-1 border-l border-white/5 pl-12 flex flex-col h-full">

                    {/* Log Terminal */}
                    <div className="flex-1 bg-[#1e293b] rounded-2xl border border-white/5 overflow-hidden flex flex-col mb-8 shadow-2xl">
                        <div className="bg-[#0f172a] px-4 py-3 border-b border-white/5 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                            <span className="ml-2 text-xs font-mono text-slate-500">network_monitor.exe</span>
                        </div>
                        <div className="flex-1 p-4 font-mono text-xs text-green-400 overflow-y-auto custom-scrollbar space-y-2">
                            {logs.length === 0 && <span className="opacity-30 text-white">System ready. Waiting for input...</span>}
                            {logs.map((L, i) => (
                                <div key={i} className="animate-in fade-in slide-in-from-left-2 duration-200">
                                    <span className="opacity-50 mr-2">{new Date().toLocaleTimeString().split(' ')[0]}</span>
                                    {L}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Context Card */}
                    <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 p-6 rounded-2xl border border-blue-500/20 min-h-[200px]">
                        <h3 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
                            <span>💡</span> Insight
                        </h3>
                        <p className="text-sm text-blue-200/80 leading-relaxed">
                            {step === 0 && "In a real app, 'Generating PKCE' happens instantly in the background. We show it here so you understand how the app protects itself from interception."}
                            {step === 1 && "Notice we are sending the 'Challenge' (the lock), not the 'Verifier' (the key). We keep the key safe until the very last step."}
                            {step === 2 && "The Authorization Code is useless to a hacker without the PKCE Verifier. That's why this flow is secure even on public Wi-Fi."}
                            {step === 3 && mode === 'oidc' && "The ID Token is signed by the server. Your app can verify this signature to trust the user's identity without asking for a password."}
                            {step === 3 && mode !== 'oidc' && "You now have an Access Token. Think of it like a hotel key card—it grants access to specific rooms (APIs) for a limited time."}
                        </p>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default function LabPage() {
    return (
        <Suspense fallback={<div>Loading Lab...</div>}>
            <LabContent />
        </Suspense>
    );
}
