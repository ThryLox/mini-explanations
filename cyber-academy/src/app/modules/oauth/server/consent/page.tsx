'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function ConsentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Extract params
    const clientId = searchParams.get('client_id');
    const redirectUri = searchParams.get('redirect_uri');
    const scope = searchParams.get('scope') || '';
    const state = searchParams.get('state');
    const codeChallenge = searchParams.get('code_challenge');

    const scopes = scope.split(' ').filter(Boolean);

    const handleDecision = async (decision: 'allow' | 'deny') => {
        setLoading(true);
        try {
            const res = await fetch('/api/oauth/authorize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_id: clientId,
                    redirect_uri: redirectUri,
                    scope,
                    state,
                    code_challenge: codeChallenge,
                    decision,
                }),
            });

            const data = await res.json();

            if (data.redirect) {
                window.location.href = data.redirect;
            } else {
                console.error('No redirect URL returned', data);
                setLoading(false);
            }
        } catch (err) {
            console.error('Consent error:', err);
            setLoading(false);
        }
    };

    if (!clientId) return <div className="p-8 text-center text-red-500">Error: Missing Parameters</div>;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-black font-sans p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">

                {/* Header */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 text-center border-b border-gray-100 dark:border-gray-800">
                    <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-3 shadow-sm">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Connection Request</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        <strong className="text-gray-900 dark:text-white">{clientId}</strong> wants to access your data.
                    </p>
                </div>

                {/* Content */}
                <div className="p-8">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Required Permissions</h3>

                    <div className="space-y-3 mb-8">
                        {scopes.map((s, i) => (
                            <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <div className="mt-1 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center text-xs">✓</div>
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{s}</p>
                                    <p className="text-xs text-gray-500">Access to standard data associated with this scope.</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => handleDecision('deny')}
                            disabled={loading}
                            className="flex-1 py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                        >
                            Deny
                        </button>
                        <button
                            onClick={() => handleDecision('allow')}
                            disabled={loading}
                            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition transform active:scale-95"
                        >
                            {loading ? 'Processing...' : 'Authorize'}
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-500">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Logged in as <strong>Alice</strong>
                        </span>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function ConsentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ConsentContent />
        </Suspense>
    );
}
