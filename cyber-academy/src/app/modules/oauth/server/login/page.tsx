'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function LoginContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const returnTo = searchParams.get('returnTo') || '/';

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        document.cookie = "auth_user=alice; path=/; max-age=3600";
        router.push(returnTo);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-black font-sans p-4">
            <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 relative overflow-hidden">

                {/* Decorative Badge */}
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl shadow-md">
                    Simulated IDP
                </div>

                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-black tracking-tight mb-2 text-gray-900 dark:text-white">Sign In</h1>
                    <p className="text-sm text-gray-500">Cyber Academy Identity Provider</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Username</label>
                        <input
                            type="text"
                            value="alice"
                            readOnly
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-gray-900 dark:text-gray-100 font-medium focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Password</label>
                        <input
                            type="password"
                            value="password"
                            readOnly
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-gray-900 dark:text-gray-100 font-medium focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-lg hover:opacity-90 transition transform active:scale-95"
                    >
                        Continue &rarr;
                    </button>
                </form>

                <p className="border-t border-gray-100 dark:border-gray-800 mt-6 pt-6 text-center text-xs text-gray-400">
                    This is a mock login page for educational purposes.
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
