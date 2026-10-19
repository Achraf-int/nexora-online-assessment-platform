import React, { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  GraduationCap,
  Award,
  Info
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { AppNotification } from '../types';

interface NotificationsPageProps {
  onNavigate: (route: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const loadNotifications = () => {
    setNotifications(storageService.getNotifications());
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = (id: string) => {
    storageService.markNotificationRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = () => {
    storageService.markAllNotificationsRead();
    loadNotifications();
  };

  const filteredNotifs = notifications.filter((n) => filter === 'ALL' || !n.read);

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'EXAM':
        return <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'RESULT':
        return <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'SYSTEM':
      default:
        return <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Notification Center
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Updates on published examinations, graded assessments, and platform bulletins.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors self-start sm:self-auto"
        >
          <CheckCheck className="w-4 h-4 text-indigo-500" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-fit">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filter === 'ALL'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filter === 'UNREAD'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Unread Only ({notifications.filter((n) => !n.read).length})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Bell className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            No notifications in this view
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            You are completely caught up! New examination alerts and score releases will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
          {filteredNotifs.map((item) => (
            <div
              key={item.id}
              className={`p-5 transition-colors flex items-start gap-4 ${
                !item.read ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-sm font-bold ${!item.read ? 'text-indigo-950 dark:text-indigo-200' : 'text-slate-900 dark:text-white'}`}>
                    {item.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono tabular-nums flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(item.date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.message}
                </p>

                <div className="pt-2 flex items-center gap-3 text-xs">
                  {item.linkRoute && (
                    <button
                      onClick={() => {
                        handleMarkRead(item.id);
                        onNavigate(item.linkRoute!);
                      }}
                      className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}

                  {!item.read && (
                    <button
                      onClick={() => handleMarkRead(item.id)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
