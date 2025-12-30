'use client';

import Link from 'next/link';
import { Suspense } from 'react';

function SqliExplanationContent() {
    return (
        <div className="min-h-screen bg-[#0f172a] font-sans text-white selection:bg-orange-500/30">
            {/* Header */}
            <div className="relative py-20 px-6 text-center border-b border-white/5 bg-[#0f172a]">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-slate-900 opacity-50"></div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <Link href="/" className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-8 transition-colors">
                        <span className="mr-2">←</span> Back to Dashboard
                    </Link>

                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-orange-900/20 border border-orange-500/30 flex items-center justify-center text-4xl shadow-[0_0_40px_-10px_rgba(249,115,22,0.2)]">
                            👾
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 bg-gradient-to-br from-orange-200 via-white to-amber-200 text-transparent bg-clip-text">
                        SQL Injection
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Trick the database into running <em>your</em> commands. <br />
                        Bypass login screens and dump sensitive data.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-16">

                {/* 1. VISUAL CONCEPT */}
                <div className="mb-24">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">1. The Broken Query</h2>
                        <p className="text-slate-400">When code just "glues" strings together, it creates a vulnerability.</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Vulnerable Code */}
                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-4">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="ml-2 text-xs text-slate-500 font-mono">auth.js</span>
                            </div>
                            <pre className="font-mono text-sm leading-relaxed overflow-x-auto">
                                <span className="text-purple-400">const</span> query = <br />
                                &nbsp;&nbsp;<span className="text-green-300">"SELECT * FROM users WHERE</span><br />
                                &nbsp;&nbsp;<span className="text-green-300">name = '"</span> + <span className="text-red-400">userInput</span> + <span className="text-green-300">"';"</span>
                            </pre>
                            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300">
                                ⚠️ <strong>Dangerous:</strong> The computer cannot tell the difference between the instructions ("SELECT...") and the data (userInput).
                            </div>
                        </div>

                        {/* The Result */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Normal Input</h3>
                                <div className="font-mono text-sm bg-black/40 p-4 rounded-xl border border-white/5">
                                    <span className="text-slate-500">Input: </span> <span className="text-blue-400">alice</span>
                                    <hr className="border-white/5 my-2" />
                                    <span className="text-slate-500">Result: </span>
                                    <span className="text-green-600">...name = 'alice';</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Malicious Input</h3>
                                <div className="font-mono text-sm bg-black/40 p-4 rounded-xl border border-red-500/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 bg-red-600 text-white text-[10px] font-bold rounded-bl-xl">INJECTION</div>
                                    <span className="text-slate-500">Input: </span> <span className="text-red-400">alice' OR '1'='1</span>
                                    <hr className="border-white/5 my-2" />
                                    <span className="text-slate-500">Result: </span>
                                    <span className="text-red-400">...name = 'alice' OR '1'='1';</span>
                                </div>
                                <p className="text-slate-400 text-sm mt-2">
                                    Because <code>'1'='1'</code> is always TRUE, the database returns <strong>every user</strong>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. THE FIX */}
                <div className="mb-24 grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-4">2. The Fix: Parameterization</h2>
                        <p className="text-slate-400 mb-6 leading-relaxed">
                            Instead of gluing strings, use <strong>placeholders</strong> (like <code>?</code> or <code>$1</code>).
                            <br /><br />
                            The database treats the input strictly as <em>data</em>, never as code.
                            Even if you type <code>' OR '1'='1</code>, the database just looks for a user literally named that weird string.
                        </p>
                    </div>
                    <div className="bg-slate-900/50 border border-green-500/20 rounded-2xl p-6 shadow-2xl">
                        <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-4">
                            <span className="ml-2 text-xs text-green-400 font-mono">secure_auth.js</span>
                        </div>
                        <pre className="font-mono text-sm leading-relaxed overflow-x-auto text-slate-300">
                            <span className="text-purple-400">const</span> query = <br />
                            &nbsp;&nbsp;<span className="text-green-300">"SELECT * FROM users WHERE name = </span><span className="text-yellow-400">$1</span><span className="text-green-300">"</span>;<br /><br />
                            <span className="text-slate-500">// Safe Execution</span><br />
                            db.execute(query, [<span className="text-blue-400">userInput</span>]);
                        </pre>
                    </div>
                </div>

                {/* 3. CTA */}
                <div className="text-center">
                    <div className="inline-block p-[2px] rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500">
                        <div className="bg-[#0f172a] rounded-2xl p-8 sm:p-12">
                            <h2 className="text-3xl font-bold text-white mb-4">Try the Injection</h2>
                            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                                Enter the <strong>Login Lab</strong>. Watch the SQL query build in real-time and exploit it to bypass the password check.
                            </p>
                            <Link
                                href="/modules/sqli/lab"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-orange-900/20 transition transform hover:scale-105"
                            >
                                Enter SQLi Lab <span>→</span>
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function SqliPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">Loading...</div>}>
            <SqliExplanationContent />
        </Suspense>
    );
}
