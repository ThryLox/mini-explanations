'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Suspense } from 'react';

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

function LabContent() {
    // Initial State - Standard jwt.io example token
    const [token, setToken] = useState<string>("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");
    const [parts, setParts] = useState(token.split('.'));

    // Attack State
    const [attackMode, setAttackMode] = useState(false);
    const [crackedSecret, setCrackedSecret] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

    // Derived State
    let payloadObj: any = { role: 'unknown' };
    let decodedPayload = "{}";

    try {
        decodedPayload = decodeSection(parts[1] || "");
        if (!decodedPayload.startsWith("Invalid")) {
            payloadObj = JSON.parse(decodedPayload);
        }
    } catch (e) {
        console.error("Payload parse error", e);
    }

    const role = payloadObj.role || 'unknown';
    const isAdmin = role === 'admin';

    const addLog = (msg: string) => setLogs(prev => [...prev.slice(-9), msg]);

    const startAttack = () => {
        setAttackMode(true);
        addLog("[*] Initializing dictionary attack...");
        addLog("[*] Target: " + token.substring(0, 15) + "...");

        let i = 0;
        const interval = setInterval(() => {
            const guesses = ["123456", "password", "qwerty", "secret", "admin", "welcome", "dragon"];
            if (i < guesses.length - 1) {
                addLog(`Trying: ${guesses[i]}... ❌`);
                i++;
            } else {
                clearInterval(interval);
                addLog(`Trying: ${guesses[i]}... ✅ MATCH!`);
                setCrackedSecret("dragon");
                setAttackMode(false);
            }
        }, 300);
    };

    const forgeToken = () => {
        // Create forged token with role: admin
        const forgedPayload = JSON.stringify({ ...payloadObj, role: "admin" });
        const forgedPayloadB64 = btoa(forgedPayload).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

        // Simulating the signature change
        const headerB64 = parts[0];
        const newSignature = "FORGED_SIGNATURE_VALIDATED_BY_WEAK_SECRET";

        const newToken = `${headerB64}.${forgedPayloadB64}.${newSignature}`;
        setParts([headerB64, forgedPayloadB64, newSignature]);
        setToken(newToken);
        addLog("[+] Token forged successfully!");
        addLog("[+] Role is now 'admin'");
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-red-500/30">
            {/* Header */}
            <header className="border-b border-white/5 bg-[#0f172a]/80 backdrop-blur sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/modules/jwt" className="text-slate-400 hover:text-white transition">← Exit Lab</Link>
                        <div className="h-6 w-px bg-white/10"></div>
                        <h1 className="font-bold text-lg flex items-center gap-2">
                            <span className="text-2xl">⚔️</span> JWT Attack Lab
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isAdmin ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                            CURRENT ROLE: {role.toUpperCase()}
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12">

                {/* MISSION CARD */}
                <div className="mb-12 bg-gradient-to-br from-red-900/10 to-orange-900/10 border border-red-500/20 rounded-3xl p-8 relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-white mb-2">Mission: Privilege Escalation</h2>
                        <p className="text-slate-400 max-w-2xl">
                            You have captured a valid JWT. The server uses a <strong>weak secret key</strong>.
                            Your objective is to crack the key and forge a new token to become <strong>ADMIN</strong>.
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">

                    {/* LEFT: ATTACK CONTROLS */}
                    <div className="space-y-6">

                        {/* STEP 1: CAPTURED TOKEN */}
                        <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-slate-900/50">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-200">1. Captured Token</h3>
                                <div className="text-xs text-slate-500 font-mono">HS256</div>
                            </div>
                            <div className="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-xs break-all text-slate-400 leading-relaxed">
                                <span className="text-red-400">{parts[0]}</span>.
                                <span className="text-purple-400">{parts[1]}</span>.
                                <span className="text-blue-400">{parts[2]}</span>
                            </div>
                        </div>

                        {/* STEP 2: CRACKER */}
                        <div className={`glass-panel p-6 rounded-2xl border border-white/10 bg-slate-900/50 ${crackedSecret ? 'opacity-50' : ''}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-200">2. Brute Force Attack</h3>
                            </div>

                            {!crackedSecret ? (
                                <button
                                    onClick={startAttack}
                                    disabled={attackMode}
                                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${attackMode ? 'bg-slate-700 cursor-wait' : 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/20'}`}
                                >
                                    {attackMode ? '🔨 Cracking...' : '🔨 Start Cracker'}
                                </button>
                            ) : (
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                                    <div className="text-green-400 font-bold">✅ Secret Found: "{crackedSecret}"</div>
                                </div>
                            )}
                        </div>

                        {/* STEP 3: PAYLOAD TAMPERING */}
                        <div className={`glass-panel p-6 rounded-2xl border border-white/10 bg-slate-900/50 ${!crackedSecret ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-200">3. Payload Tampering</h3>
                            </div>

                            <div className="mb-4">
                                <p className="text-xs text-slate-400 mb-2">Modify the payload to elevate privileges:</p>
                                <textarea
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 font-mono text-sm text-purple-300 focus:outline-none focus:border-purple-500 transition-colors"
                                    rows={4}
                                    defaultValue={JSON.stringify(payloadObj, null, 2)}
                                    disabled={isAdmin}
                                />
                            </div>

                            <button
                                onClick={forgeToken}
                                disabled={isAdmin}
                                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isAdmin ? 'bg-green-600/50 cursor-default' : 'bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-900/20'}`}
                            >
                                {isAdmin ? '✅ Access Granted' : '✍️ Sign & Forge Token'}
                            </button>
                        </div>

                    </div>


                    {/* RIGHT: TERMINAL & STATE */}
                    <div className="space-y-6">
                        {/* TERMINAL */}
                        <div className="bg-black/80 border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[400px]">
                            <div className="bg-white/5 px-4 py-2 flex items-center gap-2 border-b border-white/5">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="ml-2 text-xs font-mono text-slate-500">hacker@kali:~/tools/jwt-cracker</span>
                            </div>
                            <div className="p-4 font-mono text-xs flex-1 overflow-y-auto space-y-2">
                                <div className="text-slate-500"># Waiting for input...</div>
                                {logs.map((log, i) => (
                                    <div key={i} className={log.includes('✅') ? 'text-green-400 font-bold' : log.includes('Match') ? 'text-green-400' : 'text-slate-300'}>
                                        {log}
                                    </div>
                                ))}
                                {attackMode && <div className="animate-pulse text-red-500">_</div>}
                            </div>
                        </div>

                        {/* CURRENT TOKEN STATE */}
                        <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-slate-900/50">
                            <h3 className="font-bold text-slate-200 mb-4">Decoded Payload</h3>
                            <pre className={`text-sm font-mono p-4 rounded-xl border border-white/5 ${isAdmin ? 'bg-green-500/10 text-green-300' : 'bg-black/30 text-slate-300'}`}>
                                {decodeSection(parts[1])}
                            </pre>
                            {isAdmin && (
                                <div className="mt-4 text-center">
                                    <div className="text-5xl mb-2">🔓</div>
                                    <div className="font-bold text-white">SYSTEM UNLOCKED</div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}

export default function JwtLabPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">Loading Lab...</div>}>
            <LabContent />
        </Suspense>
    );
}
