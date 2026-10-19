import React, { useState } from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Award,
  Layers,
  Bell,
  UserCheck,
  ShieldCheck,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  Database,
  ArrowRightLeft,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';

interface AppLayoutProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ currentRoute, onNavigate, children }) => {
  const { user, isAdmin, logout, switchRole, theme, toggleTheme } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: '/exams', label: 'Exam Catalog', icon: GraduationCap },
    { id: '/results', label: 'My Results', icon: Award },
    {
      id: '/products',
      label: 'Product API Explorer',
      icon: Layers,
      highlight: true,
    },
    { id: '/notifications', label: 'Notifications', icon: Bell },
    { id: '/profile', label: 'Profile & Settings', icon: UserCheck },
    {
      id: '/admin',
      label: 'Admin Management',
      icon: ShieldCheck,
      adminOnly: true,
    },
  ];

  const handleNavClick = (route: string) => {
    onNavigate(route);
    setMobileMenuOpen(false);
  };

  const getPageTitle = () => {
    switch (currentRoute) {
      case '/dashboard':
        return 'Student Dashboard';
      case '/exams':
        return 'Assessment Catalog';
      case '/results':
        return 'My Performance History';
      case '/products':
        return 'Product API Explorer';
      case '/notifications':
        return 'Notification Center';
      case '/profile':
        return 'Profile & Account Preferences';
      case '/admin':
        return 'Administration Panel';
      default:
        if (currentRoute.startsWith('/exam-taking/')) return 'Live Assessment Session';
        if (currentRoute.startsWith('/results/')) return 'Assessment Review';
        return 'NEXORA Assessment';
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F7F8FC] dark:bg-[#0B0F19] text-[#172033] dark:text-[#E2E8F0]">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Zone */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => handleNavClick('/dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm font-black text-sm tracking-tighter">
                NX
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-none block">
                  NEXORA
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide uppercase mt-0.5 block">
                  Assessment Platform
                </span>
              </div>
            </button>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Portfolio Role Switcher Banner */}
          <div className="p-3 mx-3 mt-3 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Current Role
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                  isAdmin
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                    : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                }`}
              >
                {user?.role || 'STUDENT'}
              </span>
            </div>
            <button
              onClick={() => switchRole(isAdmin ? 'STUDENT' : 'ADMIN')}
              className="w-full flex items-center justify-center gap-1.5 py-1 px-2 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded transition-colors border border-slate-200 dark:border-slate-700"
            >
              <ArrowRightLeft className="w-3 h-3 text-indigo-500" />
              <span>Switch to {isAdmin ? 'Student' : 'Admin'}</span>
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id || currentRoute.startsWith(`${item.id}/`);
              const isLocked = item.adminOnly && !isAdmin;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </div>
                  {item.highlight && (
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-1.5 py-0.5 rounded">
                      API
                    </span>
                  )}
                  {isLocked && (
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                      Admin
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {user?.name || 'Guest User'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || 'guest@nexora.edu'}
              </p>
            </div>
            <button
              onClick={logout}
              title="Log out"
              className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Viewport Content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header: 3-Zone Contract */}
        <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4">
          {/* Zone 1: Mobile toggle + Breadcrumb / Page Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Zone 2: Subdued Context Tag */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Academic Term 2026</span>
            <span aria-hidden="true">·</span>
            <span>NEXORA Engine v2.4</span>
          </div>

          {/* Zone 3: Actions (Notifications, Theme Toggle, Profile Quick Link) */}
          <div className="flex items-center gap-2 shrink-0">
            <NotificationDropdown onNavigate={onNavigate} />

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onNavigate('/profile')}
              className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-200">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || 'U'
                )}
              </div>
            </button>
          </div>
        </header>

        {/* Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
