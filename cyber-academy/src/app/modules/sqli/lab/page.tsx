'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SqliLabPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginMessage, setLoginMessage] = useState("");

    // The vulnerability: We construct the query by concatenating the username directly.
    // NOTE: This mock query only visualizes what happens on the server.
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '*********'`;

    const handleLogin = () => {
        // VULNERABILITY CHECK:
        // 1. Tautology: OR '1'='1
        // 2. Commenting: admin' --

        const userInput = username.toLowerCase();

        // Check for Tautology injection
        if (userInput.includes("or '1'='1")) {
            setIsLoggedIn(true);
            setLoginMessage("SUCCESS: Tautology Injection! Query returned all users.");
            return;
        }

        // Check for Comment injection (needs to start with a valid user like 'admin')
        if (userInput.includes("' --") || userInput.includes("'--")) {
            // In a real DB, this would work if the first part matches a user.
            // We'll simulate it working if they try to be 'admin'.
            if (userInput.startsWith("admin")) {
                setIsLoggedIn(true);
                setLoginMessage("SUCCESS: Authentication Bypass! Password check ignored.");
                return;
            }
        }

        // Normal Login Check (Mock)
        if (username === "admin" && password === "supersecret") {
            setIsLoggedIn(true);
            setLoginMessage("Login Successful (Valid Credentials)");
        } else {
            setLoginMessage("Invalid credentials");
            setTimeout(() => setLoginMessage(""), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans p-6 md:p-12 flex items-center justify-center">

            <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-12 bg-slate-900/50 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                {/* Background Element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-[80px] -z-10"></div>

                {/* LEFT: LOGIN FORM */}
                <div className="flex flex-col justify-center">
                    <Link href="/modules/sqli" className="text-slate-500 hover:text-white mb-8 inline-block transition-colors">← Exit Lab</Link>

                    <h1 className="text-4xl font-bold text-white mb-2">Login Portal</h1>
                    <p className="text-slate-400 mb-8">Can you sign in as <strong>admin</strong> without the password?</p>

                    {!isLoggedIn ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all font-mono"
                                    placeholder="Enter username"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                onClick={handleLogin}
                                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-orange-900/20"
                            >
                                Sign In
                            </button>

                            {loginMessage && (
                                <div className="text-center text-red-400 font-bold animate-pulse">
                                    {loginMessage}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center animate-in zoom-in-95">
                            <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                                🔓
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Access Granted</h2>
                            <p className="text-green-300 font-bold mb-6">{loginMessage}</p>
                            <button
                                onClick={() => { setIsLoggedIn(false); setUsername(""); setPassword(""); setLoginMessage(""); }}
                                className="text-slate-400 hover:text-white text-sm underline"
                            >
                                Log Out / Try Again
                            </button>
                        </div>
                    )}
                </div>

                {/* RIGHT: SERVER LOGS / DEBUGGER */}
                <div className="bg-black/40 rounded-2xl border border-white/5 p-6 font-mono text-sm overflow-hidden flex flex-col relative group">
                    <div className="absolute top-4 right-4 text-xs font-bold bg-white/10 px-2 py-1 rounded text-slate-400 group-hover:bg-orange-500/20 group-hover:text-orange-300 transition-colors">
                        SERVER LOGS
                    </div>

                    <div className="text-slate-500 mb-4 font-bold tracking-widest text-xs">LIVE QUERY PREVIEW</div>

                    <div className="text-slate-400 mb-2">
                        // The server code looks like this:
                    </div>
                    <div className="text-blue-300 mb-8 border-l-2 border-slate-700 pl-4">
                        const sql = <span className="text-green-300">"SELECT * FROM users WHERE username = '"</span> + <span className="text-white bg-white/10 px-1 rounded">username</span> + <span className="text-green-300">"' AND password = '...'"</span>;
                    </div>

                    <div className="text-slate-500 mb-2 font-bold tracking-widest text-xs">GENERATED SQL</div>
                    <div className="text-lg bg-black p-4 rounded-xl border border-slate-800 break-all leading-relaxed relative">
                        {/* Highlighting the logic */}
                        <span className="text-green-400">SELECT * FROM users WHERE username = '</span>
                        <span className={`font-bold ${isLoggedIn ? 'text-red-400' : 'text-white'}`}>
                            {username}
                        </span>
                        <span className="text-green-400">' AND password = '*********'</span>
                    </div>

                    <div className="mt-8 text-slate-500 text-xs">
                        💡 <strong>Hint:</strong> Try closing the string with <code>'</code> and using <code>OR</code> logic or comments <code>--</code>.
                    </div>
                </div>

            </div>
        </div>
    );
}
