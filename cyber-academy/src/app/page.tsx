import Link from "next/link";

interface Topic {
  id: string;
  title: string;
  desc: string;
  status: "available" | "soon";
  link?: string;
  gradient: string;
  icon: string;
}

const topics: Record<string, Topic[]> = {
  identity: [
    {
      id: "oauth",
      title: "OAuth 2.1",
      desc: "Master the Authorization Code Flow. Learn deeply about PKCE, Scopes, and how delegated access works under the hood.",
      status: "available",
      link: "/modules/oauth",
      gradient: "from-blue-600 to-indigo-600",
      icon: "🔑"
    },
    {
      id: "oidc",
      title: "OpenID Connect",
      desc: "The Standard for Digital Identity. Understand ID Tokens, JWT structure, and how apps verify user identity.",
      status: "available",
      link: "/modules/oauth?mode=oidc",
      gradient: "from-purple-600 to-pink-600",
      icon: "🆔"
    },
    {
      id: "jwt",
      title: "JWT Security",
      desc: "Cracking and securing JSON Web Tokens. Brute-force weak secrets and forge admin privileges.",
      status: "available",
      link: "/modules/jwt",
      gradient: "from-gray-700 to-gray-600",
      icon: "🛡️"
    },
  ],
  vulnerabilities: [
    { id: "xss", title: "XSS Mastery", desc: "Injecting and preventing malicious scripts.", status: "soon", gradient: "from-red-600 to-orange-600", icon: "💉" },
    { id: "sqli", title: "SQL Injection", desc: "Manipulating database queries.", status: "soon", gradient: "from-orange-600 to-amber-600", icon: "👾" },
  ]
};

function ModuleCard({ topic }: { topic: Topic }) {
  const isAvailable = topic.status === "available";

  return (
    <Link href={topic.link || '#'} className={`group relative block h-full ${!isAvailable && 'pointer-events-none opacity-60'}`}>
      <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition duration-500 rounded-2xl blur-xl"
        style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}
      ></div>

      <div className={`relative h-full glass-card p-8 rounded-2xl border border-white/5 flex flex-col overflow-hidden group-hover:border-white/20 transition-all`}>
        {/* Top Gradient Line */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${topic.gradient} opacity-80`}></div>

        <div className="flex items-start justify-between mb-4">
          <span className="text-4xl">{topic.icon}</span>
          {isAvailable ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
              LIVE
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-gray-400 border border-white/10">
              SOON
            </span>
          )}
        </div>

        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">{topic.title}</h3>
        <p className="text-slate-400 leading-relaxed mb-6 flex-grow">{topic.desc}</p>

        <div className="flex items-center text-sm font-bold text-white/80 group-hover:text-white transition-colors">
          {isAvailable ? (
            <>Start Module <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span></>
          ) : (
            <span className="text-gray-500">Under Construction</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-white selection:bg-blue-500/30">

      {/* Hero Section */}
      <div className="relative pt-24 pb-20 px-6 text-center overflow-hidden">
        {/* Abstract Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute top-40 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] -z-10"></div>

        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-blue-200 via-white to-blue-200 text-transparent bg-clip-text">
          Cybersecurity Academy
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Interactive, hands-on labs for modern security protocols. <br />
          Master OAuth, OIDC, and Web Security by <em>doing</em>.
        </p>

        <div className="flex justify-center gap-4">
          <a href="#modules" className="px-8 py-3 bg-white text-slate-900 rounded-full font-bold hover:bg-gray-100 transition shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            Explore Modules
          </a>
          <a href="https://github.com/ThryLox/mini-explanations" target="_blank" className="px-8 py-3 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition backdrop-blur-sm">
            View Source
          </a>
        </div>
      </div>

      {/* Modules Grid */}
      <div id="modules" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-200">
          <span className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400">🛡️</span>
          Identity & Access Management
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {topics.identity.map(t => <ModuleCard key={t.id} topic={t} />)}
        </div>

        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-200">
          <span className="w-8 h-8 rounded-lg bg-red-600/20 flex items-center justify-center text-red-400">🕷️</span>
          Web Vulnerabilities
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.vulnerabilities.map(t => <ModuleCard key={t.id} topic={t} />)}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-slate-600 text-sm">
        <p>© 2024 Cybersecurity Academy. Built for educational purposes.</p>
      </footer>

    </main>
  );
}