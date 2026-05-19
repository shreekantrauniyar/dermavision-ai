import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <h1 className="text-lg font-semibold text-slate-800">Health Dashboard</h1>
      
      <div className="flex items-center gap-6">
        <div className="relative">
          <span className="absolute right-0 top-0 block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          <Bell size={20} className="text-slate-400 cursor-pointer hover:text-slate-900 transition-colors" />
        </div>
        
        <div className="h-8 w-[1px] bg-slate-200"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-slate-900">{user?.email?.split('@')[0] || 'User'}</p>
            <p className="text-[10px] text-slate-400">{user?.isAdmin ? 'Administrator' : 'Patient'}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200 font-bold text-xs">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
