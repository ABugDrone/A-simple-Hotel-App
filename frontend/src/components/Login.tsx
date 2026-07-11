import React, { useState } from "react";
import { api, setToken } from "../api";
import { Lock, User, LogIn, Hotel, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Staff } from "../types";

interface LoginProps {
  onLogin: (staff: Staff) => void;
  isBackendConnected?: boolean;
}

export default function Login({ onLogin, isBackendConnected }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please fill in both fields.");
      return;
    }

    if (!isBackendConnected) {
      setError("Backend server is not connected. Please start the server and try again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.login(username.trim(), password);
      if (res.token && res.staff) {
        setToken(res.token);
        setError(null);
        onLogin(res.staff);
      } else {
        setError("Invalid response from server.");
      }
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("Invalid credentials") || msg.includes("401")) {
        setError("Invalid username or password.");
      } else {
        setError("Login failed. Please check your credentials and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center items-center gap-2 mb-2">
          <img src="/icons/icon-192.svg" alt="Amirable Hotel & Hospitality" className="h-14 w-auto" />
        </div>
        <h2 className="text-center text-sm font-bold tracking-[0.2em] text-slate-400 uppercase">
          The Reserve Amirable Suite
        </h2>
        <h3 className="mt-4 text-center text-2xl font-display font-medium text-white tracking-tight">
          Staff Portal Authentication
        </h3>
        <p className="mt-2 text-center text-xs text-slate-400">
          Access is monitored. Please sign in with your credentials.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-slate-950 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3.5 rounded-lg flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 bg-emerald-400 hover:bg-emerald-350 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? "Authenticating..." : "Authenticate Log In"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
