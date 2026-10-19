import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/seedData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  theme: 'light' | 'dark';
  login: (email: string, password?: string) => Promise<boolean>;
  loginAsDemoStudent: () => void;
  loginAsDemoAdmin: () => void;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateProfile: (updatedData: Partial<User>) => void;
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'nexora_auth_current_user_v1';
const THEME_KEY = 'nexora_theme_preference';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) return JSON.parse(stored);
      // Default to demo student for immediate effortless exploration
      return INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Sync theme with DOM and localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      const isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
      const targetTheme = isDark ? 'dark' : 'light';
      setTheme(targetTheme);
      if (targetTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // fallback
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const login = async (email: string, _password?: string): Promise<boolean> => {
    // Check known demo users first
    const matched = INITIAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setUser(matched);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(matched));
      return true;
    }

    // Dynamic user create or session if non-empty
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Candidate User',
      email,
      role: email.toLowerCase().includes('admin') ? 'ADMIN' : 'STUDENT',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
      studentId: `NX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      department: 'Computer Science',
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setUser(newUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
    return true;
  };

  const loginAsDemoStudent = () => {
    setUser(INITIAL_USERS[0]);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(INITIAL_USERS[0]));
  };

  const loginAsDemoAdmin = () => {
    setUser(INITIAL_USERS[1]);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(INITIAL_USERS[1]));
  };

  const register = async (name: string, email: string, _password: string, role: UserRole = 'STUDENT'): Promise<boolean> => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      studentId: role === 'STUDENT' ? `NX-2026-${Math.floor(1000 + Math.random() * 9000)}` : `FAC-${Math.floor(100 + Math.random() * 900)}`,
      department: 'Engineering & Computing',
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setUser(newUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
  };

  const updateProfile = (updatedData: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        theme,
        login,
        loginAsDemoStudent,
        loginAsDemoAdmin,
        register,
        logout,
        switchRole,
        updateProfile,
        toggleTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
