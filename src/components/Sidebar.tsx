import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Scan, 
  History, 
  MessageSquare, 
  Settings, 
  LogOut,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

export default function Sidebar() {
  const { logout, user } = useAuth();
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Scan, label: 'New Scan', path: '/scan' },
    { icon: History, label: 'History', path: '/history' },
    { icon: MessageSquare, label: 'AI Assistant', path: '/chat' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  if (user?.isAdmin) {
    navItems.push({ icon: ShieldAlert, label: 'Admin', path: '/admin' });
  }

  return (
    <aside className="w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed left-0 top-0 transition-colors duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
          <div className="w-4 h-4 border-2 border-white rounded-full"></div>
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
          DermaVision<span className="text-indigo-600 dark:text-indigo-400">AI</span>
        </span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group text-sm font-medium",
              isActive 
                ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-semibold" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <item.icon size={18} className={cn("transition-colors", "group-hover:text-indigo-600 dark:group-hover:text-indigo-400")} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <div className="mb-4 bg-indigo-600 p-4 rounded-xl text-white">
          <p className="text-xs font-semibold uppercase opacity-80 mb-1">Medical Disclaimer</p>
          <p className="text-[10px] leading-relaxed">DermaVision is an AI aid, not a final medical diagnosis. Always consult a dermatologist.</p>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
