'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';

// --- HELPER ---
function decodeSection(str: string) {
    if (!str) return "Invalid Base64";
    try {
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
        return JSON.stringify(JSON.parse(atob(padded)), null, 2);
    } catch (e) {
        return "Invalid Base64";
    }
}

function ExplanationContent() {
    // Standard jwt.io example token
    const [token] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");
    const parts = token.split('.');

    return (
        <div className="min-h-screen bg-[#0f172a] font-sans text-white selection:bg-white/20">
            {/* Header */}
            <div className="relative py-20 px-6 text-center border-b border-white/5 bg-[#0f172a]">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-slate-900 opacity-20"></div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <Link href="/" className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-8 transition-colors">
                        <span className="mr-2">←</span> Back to Dashboard
                    </Link>

                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-gray-700/20 border border-gray-600/30 flex items-center justify-center text-4xl shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)]">
                            🛡️
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 bg-gradient-to-br from-white to-slate-400 text-transparent bg-clip-text">
                        JWT Security
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        JSON Web Tokens are the standard for modern authentication. <br />
                        But they are often misunderstood—and dangerously implemented.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-16">

                {/* 1. ANATOMY SECTION */}
                <div className="mb-24">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">1. Anatomy of a Token</h2>
                        <p className="text-slate-400">A JWT is just a string with three parts separated by dots.</p>
                    </div>

                    <div className="space-y-12">
                        {/* Visualizer (Top Full Width) */}
                        <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/10 shadow-inner text-center">
                            <div className="font-mono text-xl md:text-2xl break-all leading-relaxed max-w-4xl mx-auto mb-6">
                                <span className="text-red-400">{parts[0]}</span>
                                <span className="text-slate-500">.</span>
                                <span className="text-purple-400">{parts[1]}</span>
                                <span className="text-slate-500">.</span>
                                <span className="text-blue-400">{parts[2]}</span>
                            </div>

                            <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm font-bold opacity-80">
                                <span className="text-red-400 flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                                    <span className="w-2 h-2 rounded-full bg-red-400"></span> Header
                                </span>
                                <span className="text-purple-400 flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                                    <span className="w-2 h-2 rounded-full bg-purple-400"></span> Payload
                                </span>
                                <span className="text-blue-400 flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                                    <span className="w-2 h-2 rounded-full bg-blue-400"></span> Signature
                                </span>
                            </div>
                        </div>

                        {/* Explanations (3-Column Grid) */}
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Header Card */}
                            <div className="glass-panel p-6 rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent hover:border-red-500/40 transition-colors">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-red-500/20 rounded-lg text-red-400">🏷️</div>
                                    <h3 className="text-lg font-bold text-red-100">1. Header</h3>
                                </div>
                                <p className="text-slate-400 text-sm mb-4 h-10">Metadata covering the algorithm (e.g., HS256) and token type.</p>
                                <div className="bg-black/40 rounded-lg p-3 border border-red-500/10">
                                    <pre className="text-red-300 text-xs font-mono overflow-auto">{decodeSection(parts[0])}</pre>
                                </div>
                            </div>

                            {/* Payload Card */}
                            <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent hover:border-purple-500/40 transition-colors">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">📦</div>
                                    <h3 className="text-lg font-bold text-purple-100">2. Payload</h3>
                                </div>
                                <p className="text-slate-400 text-sm mb-4 h-10">Data claims (user ID, role). <strong className="text-white">Readable by anyone.</strong></p>
                                <div className="bg-black/40 rounded-lg p-3 border border-purple-500/10">
                                    <pre className="text-purple-300 text-xs font-mono overflow-auto">{decodeSection(parts[1])}</pre>
                                </div>
                            </div>

                            {/* Signature Card */}
                            <div className="glass-panel p-6 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent hover:border-blue-500/40 transition-colors">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">✍️</div>
                                    <h3 className="text-lg font-bold text-blue-100">3. Signature</h3>
                                </div>
                                <p className="text-slate-400 text-sm mb-4">
                                    Computed using: <br />
                                    <code>HMACSHA256(base64(header) + "." + base64(payload), <span className="text-yellow-400">secret</span>)</code>
                                </p>
                                <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/10 text-xs text-blue-300 font-mono italic">
                                    // Verifies the data hasn't been tampered with
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* 2. THE VULNERABILITY */}
                <div className="mb-24">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">2. The Weak Secret Attack</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            If the server uses a simple password (like "secret123") to sign tokens, a hacker can brute-force it offline.
                        </p>
                    </div>

                    <div className="relative bg-black/50 border border-white/10 rounded-3xl p-8 lg:p-12 overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[80px]"></div>

                        <div className="grid lg:grid-cols-3 gap-8 relative z-10 text-center">
                            <div className="p-6">
                                <div className="text-4xl mb-4">📥</div>
                                <h3 className="font-bold text-white mb-2">1. Capture</h3>
                                <p className="text-slate-400 text-sm">Attacker creates an account and gets a valid token.</p>
                            </div>
                            <div className="p-6 relative">
                                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-1 bg-gradient-to-r from-slate-700 to-transparent"></div>
                                <div className="text-4xl mb-4">🔨</div>
                                <h3 className="font-bold text-white mb-2">2. Crack</h3>
                                <p className="text-slate-400 text-sm">Attacker runs a dictionary attack to guess the signature's password.</p>
                            </div>
                            <div className="p-6">
                                <div className="text-4xl mb-4">✍️</div>
                                <h3 className="font-bold text-white mb-2">3. Forge</h3>
                                <p className="text-slate-400 text-sm">Using the found password, they sign a NEW token with <code>admin: true</code>.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. THE "NONE" ALGORITHM */}
                <div className="mb-24 grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-4">3. Beware the "None" Algorithm</h2>
                        <p className="text-slate-400 mb-6 leading-relaxed">
                            Some JWT libraries historically supported <code>alg: "none"</code>.
                            This meant "this token is not signed".
                            <br /><br />
                            Hackers would simply change the header to <code>{`{"alg": "none"}`}</code>, remove the signature, and the server would accept <em>any</em> payload they sent!
                        </p>
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <h4 className="font-bold text-red-400 mb-2">Defense:</h4>
                            <p className="text-sm text-slate-300">Always explicitly whitelist allowed algorithms (e.g., only allow <code>HS256</code> or <code>RS256</code>) in your backend verification logic.</p>
                        </div>
                    </div>
                    <div className="bg-black/50 border border-white/10 rounded-2xl p-6 font-mono text-sm shadow-2xl">
                        <div className="text-slate-500 mb-2">// Malicious Header</div>
                        <div className="text-red-400">
                            {`{
  "alg": "none",
  "typ": "JWT"
}`}
                        </div>
                        <div className="text-slate-500 my-4">// Malicious Payload</div>
                        <div className="text-purple-400">
                            {`{
  "sub": "123",
  "role": "admin"
}`}
                        </div>
                        <div className="text-slate-500 mt-2">// No Signature Required!</div>
                    </div>
                </div>

                {/* 4. CTA */}
                <div className="text-center">
                    <div className="inline-block p-[2px] rounded-2xl bg-gradient-to-r from-red-500 to-orange-500">
                        <div className="bg-[#0f172a] rounded-2xl p-8 sm:p-12">
                            <h2 className="text-3xl font-bold text-white mb-4">Ready to try it?</h2>
                            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                                Enter the simulation lab. You will act as the attacker, crack a weak JWT, and forge your way to admin access.
                            </p>
                            <Link
                                href="/modules/jwt/lab"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-red-900/20 transition transform hover:scale-105"
                            >
                                Enter Attack Lab <span>→</span>
                            </Link>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function JwtPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">Loading...</div>}>
            <ExplanationContent />
        </Suspense>
    );
}
