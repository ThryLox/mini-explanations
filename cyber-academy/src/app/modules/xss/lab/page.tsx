'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function XssLabPage() {
    const [messages, setMessages] = useState<{ id: number, text: string, user: string }[]>([
        { id: 1, text: "Welcome to the chat! Feel free to introduce yourself.", user: "Admin" },
        { id: 2, text: "Is this chat secure?", user: "Guest" },
        { id: 3, text: "Of course! We use 100% organic HTML.", user: "Admin" },
    ]);
    const [input, setInput] = useState("");
    const [showHacked, setShowHacked] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        // SIMULATE VULNERABILITY:
        // We look for common XSS signatures: <script>, onerror=, onload=, javascript:
        // Combined with an 'alert' call to confirm exploitation.
        const xssSignatures = ["<script", "onerror=", "onload=", "javascript:", "onmouseover="];
        const isVulnerable = xssSignatures.some(sig => input.toLowerCase().includes(sig)) && input.toLowerCase().includes("alert");

        if (isVulnerable) {
            setTimeout(() => {
                setShowHacked(true);
            }, 500);
        }

        const newMessage = { id: Date.now(), text: input, user: "You" };
        setMessages(prev => [...prev, newMessage]);
        setInput("");
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans p-6 md:p-12">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 h-[80vh]">

                {/* LEFT: ATTACKER PANEL */}
                <div className="flex flex-col gap-6">
                    <div>
                        <Link href="/modules/xss" className="text-slate-400 hover:text-white mb-4 inline-block">← Exit Lab</Link>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 text-transparent bg-clip-text">v0.1 Chat App</h1>
                        <p className="text-slate-400 mt-2">
                            This specific version of our chat app renders messages using <code>innerHTML</code>.
                            Can you pop an alert box to prove it's vulnerable?
                        </p>
                    </div>

                    <div className="flex-grow bg-slate-900 border border-white/10 rounded-2xl p-6 flex flex-col shadow-2xl">
                        <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-green-400 mb-4 border border-white/5">
                            <span className="text-slate-500"># Payload Hint:</span><br />
                            &lt;script&gt;alert(1)&lt;/script&gt;<br />
                            <span className="text-slate-500 mt-2 block"># Or try an image vector:</span>
                            &lt;img src=x onerror=alert(1)&gt;
                        </div>

                        <div className="mt-auto">
                            <label className="text-sm font-bold text-slate-300 mb-2 block">Your Message:</label>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white font-mono focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                rows={4}
                                placeholder="Type something..."
                            />
                            <button
                                onClick={handleSend}
                                className="mt-4 w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-red-900/20"
                            >
                                Send Message
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT: VICTIM VIEW (The Browser) */}
                <div className="relative bg-white text-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col border-4 border-slate-800">
                    {/* Fake Browser Toolbar */}
                    <div className="bg-slate-100 border-b border-slate-200 p-3 flex items-center gap-3">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="flex-grow bg-white border border-slate-300 rounded px-3 py-1 text-xs text-slate-500 flex items-center gap-2">
                            <span>🔒</span> social-chat.internal/room/general
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-grow bg-slate-50 p-6 overflow-y-auto space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.user === 'You' ? 'items-end' : 'items-start'}`}>
                                <span className="text-xs text-slate-400 mb-1 px-1">{msg.user}</span>
                                {/* 
                                    VULNERABILITY: 
                                    We aren't actually using dangerouslySetInnerHTML here because we want to simulate the alert safely. 
                                    But visually we render it "as code" if it looks like code.
                                */}
                                <div
                                    className={`relative max-w-[80%] px-4 py-2 rounded-2xl shadow-sm text-sm break-words ${msg.user === 'You'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white border border-slate-200 rounded-tl-none'
                                        }`}
                                >
                                    {/* Naive Rendering for visual effect */}
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* HACKED OVERLAY */}
                    {showHacked && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                            <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-sm w-full animate-in zoom-in-95 duration-300">
                                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-500 flex justify-between items-center">
                                    <span>social-chat.internal says</span>
                                    <button onClick={() => setShowHacked(false)} className="hover:text-red-500">×</button>
                                </div>
                                <div className="p-8 text-center">
                                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                                        ⚠️
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">XSS Success!</h3>
                                    <p className="text-slate-500 mb-6">
                                        You successfully injected a script! <br />
                                        In a real attack, you could have just stolen the admin's session cookie.
                                    </p>
                                    <button
                                        onClick={() => setShowHacked(false)}
                                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                                    >
                                        OK
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
