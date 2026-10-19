import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  GraduationCap,
  Sun,
  Moon,
  RotateCcw,
  CheckCircle2,
  Mail,
  Building,
  KeyRound,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';

export const ProfilePage: React.FC = () => {
  const { user, isAdmin, switchRole, updateProfile, theme, toggleTheme } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || 'Computer Science');
  const [isSaved, setIsSaved] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, department });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetSeedData = () => {
    if (confirm('Are you sure you want to restore the platform to initial seed data? This will reset all exams, questions, and attempts.')) {
      storageService.resetAllData();
      setResetSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Profile & System Settings
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your account profile, role permissions, appearance theme, and local demo data storage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Role Summary Card */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-950 mx-auto overflow-hidden border-2 border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-xl font-bold text-indigo-700 dark:text-indigo-300">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {user?.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.email}
              </p>
              <div className="mt-2">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                    isAdmin
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                      : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                  }`}
                >
                  {user?.role} ACCESS
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <div>Student ID: <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{user?.studentId || 'NX-2026-8812'}</span></div>
              <div>Joined: <span className="text-slate-800 dark:text-slate-200">{user?.joinedDate || '2025-09-01'}</span></div>
            </div>
          </div>

          {/* Quick Role Toggle Box */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
            <span className="font-bold text-slate-900 dark:text-white block">
              Portfolio Role Switcher
            </span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              Toggle roles instantly to test both the Student assessment flow and the Admin creation console.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => switchRole('STUDENT')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors ${
                  !isAdmin
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => switchRole('ADMIN')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors ${
                  isAdmin
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Administrator
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Settings Form & Appearance */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Form */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Personal Information
            </h3>

            {isSaved && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Profile details updated successfully.</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Institutional Email (Read-Only)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Department / Program
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Theme & Display Preferences */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Interface Theme Preferences
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize the look and feel of the NEXORA assessment client.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (theme === 'dark') toggleTheme();
                }}
                className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-colors ${
                  theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-950 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600'
                }`}
              >
                <Sun className="w-5 h-5 text-amber-500" />
                <div>
                  <div className="text-xs font-semibold">Light Mode</div>
                  <div className="text-[11px] text-slate-400 font-normal">Crisp white canvas</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (theme === 'light') toggleTheme();
                }}
                className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-colors ${
                  theme === 'dark'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-white font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600'
                }`}
              >
                <Moon className="w-5 h-5 text-indigo-400" />
                <div>
                  <div className="text-xs font-semibold">Dark Mode</div>
                  <div className="text-[11px] text-slate-400 font-normal">Midnight slate theme</div>
                </div>
              </button>
            </div>
          </div>

          {/* Data Reset (Portfolio Utility) */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Demonstration Data Storage
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Reset all examinations, test questions, candidate submissions, and notification states back to the original clean demo seeds.
            </p>

            {resetSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300">
                Storage restored. Refreshing environment...
              </div>
            )}

            <div className="pt-1">
              <button
                onClick={handleResetSeedData}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-rose-300 dark:border-rose-900/60 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Factory Demo State</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
