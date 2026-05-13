// src/admin/pages/LoginPage.jsx — Premium login
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [username, setUsername]       = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [suspended, setSuspended]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuspended(false); setLoading(true);
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.status === "SUSPENDED") setSuspended(true);
      setError(resp?.error || "Login failed. Please try again.");
    } finally { setLoading(false); }
  };

  if (suspended) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Shield size={24} className="text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Account Suspended</h1>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">Your admin account has been suspended. Contact the platform administrator.</p>
          <button onClick={() => { setSuspended(false); setError(""); }} className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
            ← Try different account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-amber-500/[0.06] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-orange-500/[0.04] rounded-full blur-[100px]" />
      </div>

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
        backgroundSize: "50px 50px",
      }} />

      <div className="relative z-10 w-full max-w-[380px]">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-7 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-black/20">
          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/25">
              <Shield size={22} className="text-slate-950" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">Admin Portal</h1>
            <p className="text-xs text-slate-500 mt-1">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-5 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/15 text-red-400 text-[13px] text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Username</label>
              <input
                type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                required autoFocus
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/10 transition-all"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)} required
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/10 transition-all"
                  placeholder="Enter password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-sm hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={15} className="animate-spin" /> Signing in...</> : "Sign In"}
            </button>
          </form>
        </div>
        <p className="text-center text-[10px] text-slate-600 mt-5">Authorized personnel only</p>
      </div>
    </div>
  );
}