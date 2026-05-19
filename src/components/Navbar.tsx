import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-300">
      <h1 className="text-lg font-semibold text-slate-800 dark:text-white">Health Dashboard</h1>
      
      <div className="flex items-center gap-6">
        <div className="relative">
          <span className="absolute right-0 top-0 block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"></span>
          <Bell size={20} className="text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" />
        </div>
        
        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700"></div>

        <Link to="/settings" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-slate-900 dark:text-white">{user?.email?.split('@')[0] || 'User'}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">{user?.isAdmin ? 'Administrator' : 'Patient'}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-bold text-xs">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
        </Link>
      </div>
    </header>
  );
}
