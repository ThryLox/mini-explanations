'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

function ExplanationContent() {
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode') === 'oidc' ? 'oidc' : 'oauth';

    const theme = mode === 'oidc'
        ? { gradient: 'from-purple-600 to-pink-600', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' }
        : { gradient: 'from-blue-600 to-indigo-600', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };

    return (
        <div className="min-h-screen bg-[#0f172a] font-sans text-white selection:bg-white/20">

            {/* Header */}
            <div className="relative py-20 px-6 text-center border-b border-white/5 bg-[#0f172a]">
                <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} opacity-5`}></div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <Link href="/" className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-8 transition-colors">
                        <span className="mr-2">←</span> Back to Dashboard
                    </Link>

                    <div className="flex justify-center mb-6">
                        <div className={`w-20 h-20 rounded-2xl ${theme.bg} ${theme.border} border flex items-center justify-center text-4xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]`}>
                            {mode === 'oidc' ? '🆔' : '🔑'}
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 bg-gradient-to-br from-white to-slate-400 text-transparent bg-clip-text">
                        {mode === 'oidc' ? 'OpenID Connect' : 'OAuth 2.1 Access'}
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        {mode === 'oidc'
                            ? 'The modern way to verify identity on the web. Understand how "Sign in with Google" actually works under the hood.'
                            : 'The industry standard for secure access delegation. Learn why we use Tokens instead of Passwords.'}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-16">

                {/* VISUAL PROCESS DIAGRAM */}
                <div className="mb-24">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">How it Works</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            {mode === 'oidc'
                                ? "OIDC adds an identity layer on top of OAuth 2.0. Instead of just getting a key, you get an ID badge."
                                : "The Authorization Code flow ensures the user's credentials never touch the client application."}
                        </p>
                    </div>

                    <div className="relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent -translate-y-1/2 z-0"></div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">

                            {/* STEP 1: USER */}
                            <div className="group relative">
                                <div className={`glass-panel p-6 rounded-2xl border ${theme.border} bg-[#0f172a] relative transition-transform transform group-hover:-translate-y-2`}>
                                    <div className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700`}>Step 1</div>
                                    <div className="text-4xl mb-4">👤</div>
                                    <h3 className="text-lg font-bold text-white mb-2">User</h3>
                                    <p className="text-sm text-slate-400">Initiates the login. Represents the "Resource Owner".</p>
                                </div>
                                {/* Arrow */}
                                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 translate-x-1/2 text-slate-600 text-xl">➜</div>
                            </div>

                            {/* STEP 2: APP (CLIENT) */}
                            <div className="group relative">
                                <div className={`glass-panel p-6 rounded-2xl border ${theme.border} bg-[#0f172a] relative transition-transform transform group-hover:-translate-y-2`}>
                                    <div className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700`}>Step 2</div>
                                    <div className="text-4xl mb-4">💻</div>
                                    <h3 className="text-lg font-bold text-white mb-2">Client App</h3>
                                    <p className="text-sm text-slate-400">Redirects user to Auth Server. Generates <code>PKCE</code> verifier.</p>
                                </div>
                                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 translate-x-1/2 text-slate-600 text-xl">➜</div>
                            </div>

                            {/* STEP 3: AUTH SERVER */}
                            <div className="group relative">
                                <div className={`glass-panel p-6 rounded-2xl border ${theme.border} bg-[#0f172a] relative transition-transform transform group-hover:-translate-y-2 shadow-[0_0_50px_-20px_rgba(255,255,255,0.1)]`}>
                                    <div className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-bold ${mode === 'oidc' ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'} border border-white/10`}>Step 3</div>
                                    <div className="text-4xl mb-4">🛡️</div>
                                    <h3 className="text-lg font-bold text-white mb-2">Auth Server</h3>
                                    <p className="text-sm text-slate-400">Verifies creds. Issues an <strong className="text-white">Auth Code</strong> (not the token yet!).</p>
                                </div>
                                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 translate-x-1/2 text-slate-600 text-xl">➜</div>
                            </div>

                            {/* STEP 4: TOKENS */}
                            <div className="group relative">
                                <div className={`glass-panel p-6 rounded-2xl border ${theme.border} bg-[#0f172a] relative transition-transform transform group-hover:-translate-y-2`}>
                                    <div className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700`}>Step 4</div>
                                    <div className="text-4xl mb-4">{mode === 'oidc' ? '🆔' : '🔑'}</div>
                                    <h3 className="text-lg font-bold text-white mb-2">{mode === 'oidc' ? 'ID Token' : 'Access Token'}</h3>
                                    <p className="text-sm text-slate-400">
                                        {mode === 'oidc'
                                            ? "Client exchanges Code for ID Token (Identity) + Access Token."
                                            : "Client exchanges Code for Access Token (Permission)."
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* CONTENT GRID */}
                <div className="grid lg:grid-cols-2 gap-12 items-start mb-20">

                    {/* Left: Deep Dive */}
                    <div className="space-y-8">
                        <div className="glass-panel p-8 rounded-2xl border border-white/10">
                            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                                <span className="text-2xl">🎓</span> {mode === 'oidc' ? 'Identity Mechanics' : 'Access Mechanics'}
                            </h2>

                            {mode === 'oidc' ? (
                                <div className="space-y-8">
                                    <div className="relative pl-6 border-l-2 border-purple-500/30">
                                        <h3 className="text-lg font-bold text-purple-400 mb-2">1. The Scope: `openid`</h3>
                                        <p className="text-slate-400 leading-relaxed">
                                            This magic word tells the server: "I don't just want to access data, I want to know properites about the user."
                                        </p>
                                    </div>
                                    <div className="relative pl-6 border-l-2 border-purple-500/30">
                                        <h3 className="text-lg font-bold text-purple-400 mb-2">2. The ID Token (JWT)</h3>
                                        <p className="text-slate-400 leading-relaxed mb-4">
                                            A cryptographically signed badge. It contains <code>claims</code> like name, email, and picture.
                                        </p>
                                        <div className="p-4 rounded-lg bg-black/50 font-mono text-xs text-slate-300 whitespace-pre overflow-x-auto border border-white/5">
                                            {`{
  "iss": "https://auth-server.com",
  "sub": "user_123",
  "aud": "my_app",
  "exp": 1311281970,
  "iat": 1311280970
}`}
                                        </div>
                                    </div>
                                    <div className="relative pl-6 border-l-2 border-purple-500/30">
                                        <h3 className="text-lg font-bold text-purple-400 mb-2">3. The UserInfo Endpoint</h3>
                                        <p className="text-slate-400 leading-relaxed">
                                            Often, the ID Token is small. To get more details (like a high-res profile photo), the app uses the Access Token to call the <code>/userinfo</code> API.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="relative pl-6 border-l-2 border-blue-500/30">
                                        <h3 className="text-lg font-bold text-blue-400 mb-2">1. The Authorization Code</h3>
                                        <p className="text-slate-400 leading-relaxed">
                                            Think of this as a "Cashier's Check" or a claim ticket. It's useless to a hacker without the PKCE Verifier.
                                        </p>
                                    </div>
                                    <div className="relative pl-6 border-l-2 border-blue-500/30">
                                        <h3 className="text-lg font-bold text-blue-400 mb-2">2. The Exchange</h3>
                                        <p className="text-slate-400 leading-relaxed">
                                            The client sends the Code + PKCE Verifier to the server's <code>/token</code> endpoint. This happens on the "Back Channel" (server-to-server), invisible to the user's browser history.
                                        </p>
                                    </div>
                                    <div className="relative pl-6 border-l-2 border-blue-500/30">
                                        <h3 className="text-lg font-bold text-blue-400 mb-2">3. The Access Token</h3>
                                        <p className="text-slate-400 leading-relaxed text-sm">
                                            The final key. This obscure string (<code>atk_83...</code>) is what you put in the API Header:
                                        </p>
                                        <div className="mt-2 p-3 rounded-lg bg-black/50 font-mono text-sm text-green-400 border border-white/5">
                                            Authorization: Bearer atk_83j...
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: CTA Area */}
                    <div className="sticky top-10">
                        <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 p-32 bg-gradient-to-br ${theme.gradient} blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity`}></div>

                            <div className="relative z-10 text-center">
                                <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-500">🧪</div>
                                <h3 className="text-2xl font-bold text-white mb-4">Ready to try it?</h3>
                                <p className="text-slate-400 mb-8 leading-relaxed">
                                    Enter the simulation lab. You will act as the Client Application, initiating the flow, handling the redirect, and exchanging the code manually.
                                </p>

                                <Link
                                    href={`/modules/oauth/lab?mode=${mode}`}
                                    className={`inline-flex w-full items-center justify-center gap-2 py-4 px-8 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r ${theme.gradient} hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all`}
                                >
                                    <span>Enter {mode === 'oidc' ? 'OIDC' : 'OAuth'} Lab</span>
                                    <span>→</span>
                                </Link>

                                <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-3 gap-2 text-center">
                                    <div>
                                        <div className="text-xl font-bold text-white">100%</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">Interactive</div>
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-white">Live</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">Network</div>
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-white">Real</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">Crypto</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function OAuthExplanationPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">Loading...</div>}>
            <ExplanationContent />
        </Suspense>
    );
}
