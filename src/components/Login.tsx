import React, { useState } from 'react';
import { Lock, User, Sparkles, AlertTriangle, KeyRound } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Both username and password are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.token) {
        onLoginSuccess(data.token);
      } else {
        setError(data.error || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to connect to the authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 selection:bg-amber-500/30 selection:text-white leading-normal antialiased">
      <div className="w-full max-w-md bg-[#121212] rounded-3xl border border-zinc-800 shadow-2xl p-8 space-y-8 animate-in fade-in duration-300">
        
        {/* Brand identity section */}
        <div className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-500/15 flex items-center justify-center border border-amber-500/30 text-amber-550 shadow-md">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-sans font-bold tracking-tight text-white text-2xl flex items-center justify-center gap-2">
              Au Design Studio
              <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-medium border border-amber-500/20">AI Studio</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-mono">Backend Secure Access</p>
          </div>
        </div>

        {/* Input parameters form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl p-3.5 flex gap-2 text-rose-300 text-xs animate-in slide-in-from-top-1 duration-200">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-amber-500/70" />
              Username
            </label>
            <div className="relative">
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                disabled={loading}
                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl p-3.5 pl-10 text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/15"
                autoComplete="username"
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-amber-500/70" />
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={loading}
                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl p-3.5 pl-10 text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/15"
                autoComplete="current-password"
              />
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-650 text-black font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wide cursor-pointer border border-amber-600/10 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[10px] text-zinc-600 leading-relaxed max-w-[280px] mx-auto">
            Authorized access only. If you do not have credential parameters, config them in server environment.
          </p>
        </div>

      </div>
    </div>
  );
}
