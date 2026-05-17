"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Target, Loader2, Eye, EyeOff } from "lucide-react";

const DEMO_ACCOUNTS = [
  { role: "EMPLOYEE", email: "employee@demo.com", color: "from-blue-500 to-blue-600", icon: "👤" },
  { role: "MANAGER", email: "manager@demo.com", color: "from-purple-500 to-purple-600", icon: "👔" },
  { role: "ADMIN", email: "admin@demo.com", color: "from-orange-500 to-orange-600", icon: "🔑" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result?.ok) {
      router.push("/");
      router.refresh();
    }
  };

  const loginAsDemo = async (demoEmail: string) => {
    setLoading(true);
    setError(null);
    
    let target = "/employee/dashboard";
    if (demoEmail.includes("manager")) target = "/manager/dashboard";
    if (demoEmail.includes("admin")) target = "/admin/dashboard";

    const result = await signIn("credentials", {
      email: demoEmail,
      password: "demo123",
      redirect: false,
    });

    if (result?.error) {
      setError(`Login failed: ${result.error}. (Check DB or Vercel URL/Secret)`);
      setLoading(false);
      return;
    }

    if (result?.ok) {
      router.push(target);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-2xl mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">AtomQuest</h1>
          <p className="text-purple-300 mt-1">Goal Setting & Tracking Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-60 shadow-lg shadow-violet-900/50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-white/60 text-xs text-center mb-3">
              🎭 Quick Demo Access (Hackathon Mode)
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  onClick={() => loginAsDemo(account.email)}
                  disabled={loading}
                  className={`flex flex-col items-center gap-1 py-2.5 px-2 bg-gradient-to-br ${account.color} rounded-xl text-white text-xs font-medium hover:opacity-90 transition-all disabled:opacity-50 shadow-lg`}
                >
                  <span className="text-lg">{account.icon}</span>
                  <span>{account.role}</span>
                </button>
              ))}
            </div>
            <p className="text-white/40 text-xs text-center mt-2">
              All use password: <code className="bg-white/10 px-1.5 py-0.5 rounded">demo123</code>
            </p>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          AtomQuest Hackathon 1.0 • Built with Next.js + Supabase + Claude AI
        </p>
      </div>
    </div>
  );
}
