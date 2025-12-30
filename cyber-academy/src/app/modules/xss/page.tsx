'use client';

import Link from 'next/link';
import { Suspense } from 'react';

function XssExplanationContent() {
    return (
        <div className="min-h-screen bg-[#0f172a] font-sans text-white selection:bg-red-500/30">
            {/* Header */}
            <div className="relative py-20 px-6 text-center border-b border-white/5 bg-[#0f172a]">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-slate-900 opacity-50"></div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <Link href="/" className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-8 transition-colors">
                        <span className="mr-2">←</span> Back to Dashboard
                    </Link>

                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-red-900/20 border border-red-500/30 flex items-center justify-center text-4xl shadow-[0_0_40px_-10px_rgba(220,38,38,0.2)]">
                            💉
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 bg-gradient-to-br from-red-200 via-white to-orange-200 text-transparent bg-clip-text">
                        Cross-Site Scripting
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        When an application lets untrusted inputs rewrite the web page. <br />
                        Attackers inject scripts &rarr; Your browser executes them.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-16">

                {/* 1. VISUAL CONCEPT */}
                <div className="mb-24">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">1. How Injection Works</h2>
                        <p className="text-slate-400">The browser trusts whatever the server sends it. Even malicious code.</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 items-center">
                        {/* Step 1: Input */}
                        <div className="glass-panel p-8 rounded-2xl border border-white/10 bg-white/5 text-center relative group hover:-translate-y-1 transition-transform duration-300">
                            <div className="text-4xl mb-6 bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-white/10">⌨️</div>
                            <h3 className="text-xl font-bold mb-3">1. Attacker Input</h3>
                            <div className="bg-black/50 p-3 rounded-lg font-mono text-xs text-red-300 border border-red-500/20 text-left">
                                &lt;script&gt;<br />
                                &nbsp;&nbsp;fetch('/steal?c='+cookie)<br />
                                &lt;/script&gt;
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="hidden lg:flex justify-center text-slate-500 text-4xl">→</div>

                        {/* Step 2: Render */}
                        <div className="glass-panel p-8 rounded-2xl border border-white/10 bg-white/5 text-center relative group hover:-translate-y-1 transition-transform duration-300">
                            <div className="text-4xl mb-6 bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-white/10">⚙️</div>
                            <h3 className="text-xl font-bold mb-3">2. Server Renders</h3>
                            <p className="text-slate-400 text-sm mb-4">The server places the input directly into the HTML without correct escaping.</p>
                            <div className="bg-black/50 p-3 rounded-lg font-mono text-xs text-blue-300 border border-blue-500/20 text-left">
                                &lt;div&gt;<span className="text-red-300">&lt;script&gt;...&lt;/script&gt;</span>&lt;/div&gt;
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. THREE TYPES */}
                <div className="mb-24">
                    <h2 className="text-3xl font-bold text-white mb-12 text-center">2. The Three Flavors of XSS</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Reflected */}
                        <div className="p-6 rounded-2xl border border-orange-500/20 bg-gradient-to-b from-orange-500/5 to-transparent hover:bg-orange-500/10 transition-colors">
                            <h3 className="text-xl font-bold text-orange-200 mb-2">Reflected XSS</h3>
                            <div className="text-xs font-bold bg-orange-500/20 text-orange-300 inline-block px-2 py-1 rounded mb-4">Most Common</div>
                            <p className="text-slate-400 text-sm mb-4">The payload comes from the current HTTP request (usually a URL parameter).</p>
                            <div className="bg-black/40 p-3 rounded border border-white/5 font-mono text-xs text-slate-300 break-all">
                                site.com/search?q=<span className="text-red-400">&lt;script&gt;...</span>
                            </div>
                        </div>

                        {/* Stored */}
                        <div className="p-6 rounded-2xl border border-red-500/20 bg-gradient-to-b from-red-500/5 to-transparent hover:bg-red-500/10 transition-colors">
                            <h3 className="text-xl font-bold text-red-200 mb-2">Stored XSS</h3>
                            <div className="text-xs font-bold bg-red-500/20 text-red-300 inline-block px-2 py-1 rounded mb-4">Most Dangerous</div>
                            <p className="text-slate-400 text-sm mb-4">The payload is saved in the database (e.g., a comment). ALL visitors execute it.</p>
                            <div className="bg-black/40 p-3 rounded border border-white/5 font-mono text-xs text-slate-300">
                                DB: comments_table<br />
                                Row 1: "Nice post!"<br />
                                Row 2: <span className="text-red-400">&lt;script&gt;...</span>
                            </div>
                        </div>

                        {/* DOM */}
                        <div className="p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-transparent hover:bg-purple-500/10 transition-colors">
                            <h3 className="text-xl font-bold text-purple-200 mb-2">DOM-Based XSS</h3>
                            <div className="text-xs font-bold bg-purple-500/20 text-purple-300 inline-block px-2 py-1 rounded mb-4">Client-Side</div>
                            <p className="text-slate-400 text-sm mb-4">The vulnerability is in the client-side JS code, not the server response.</p>
                            <div className="bg-black/40 p-3 rounded border border-white/5 font-mono text-xs text-slate-300">
                                div.innerHTML = location.hash;
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. CTA */}
                <div className="text-center">
                    <div className="inline-block p-[2px] rounded-2xl bg-gradient-to-r from-red-600 to-orange-600">
                        <div className="bg-[#0f172a] rounded-2xl p-8 sm:p-12">
                            <h2 className="text-3xl font-bold text-white mb-4">Test your skills</h2>
                            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                                Enter the <strong>Vulnerable Chat Lab</strong>. Your goal is to inject a payload that steals the admin's session cookie.
                            </p>
                            <Link
                                href="/modules/xss/lab"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-red-900/20 transition transform hover:scale-105"
                            >
                                Enter XSS Lab <span>→</span>
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function XssPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">Loading...</div>}>
            <XssExplanationContent />
        </Suspense>
    );
}
