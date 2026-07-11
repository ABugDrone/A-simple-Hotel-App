import React, { useState } from "react";
import { api, setToken } from "../api";
import { Lock, AlertCircle, Eye, EyeOff, Shield, CheckCircle } from "lucide-react";
import { Staff } from "../types";

interface ChangePasswordProps {
  staff: Staff;
  onComplete: (updatedStaff: Staff) => void;
  onSkip: () => void;
}

export default function ChangePassword({ staff, onComplete, onSkip }: ChangePasswordProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword.length < 4) {
      setError("New password must be at least 4 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (oldPassword === newPassword) {
      setError("New password must be different from current password.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.changePassword(oldPassword, newPassword);
      if (res.token && res.staff) {
        setToken(res.token);
        setSuccess(true);
        setTimeout(() => onComplete(res.staff), 1000);
      } else {
        setError("Server returned an unexpected response.");
      }
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("incorrect") || msg.includes("401")) {
        setError("Current password is incorrect.");
      } else {
        setError("Failed to change password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-white mb-2">Password Updated</h2>
          <p className="text-sm text-slate-400">Your password has been changed successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 mb-8 text-center">
        <div className="flex justify-center items-center gap-2 mb-2">
          <img src="/logo.png" alt="Amirable Hotel & Hospitality" className="h-14 w-auto" />
        </div>
        <h2 className="text-lg font-display font-medium text-white tracking-tight mt-2">
          Change Your Password
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Welcome, <span className="text-emerald-400 font-bold">{staff.name}</span>. For security purposes, you are required to change your password before continuing.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 w-full">
        <div className="bg-slate-950 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3.5 rounded-lg flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type={showOld ? "text" : "password"}
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-colors"
                >
                  {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type={showNew ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 4 characters)"
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-colors"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type={showNew ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Shield className="w-4 h-4" />
                <span>{loading ? "Updating..." : "Update Password"}</span>
              </button>

              <button
                type="button"
                onClick={onSkip}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
              >
                Skip — Keep Current Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
