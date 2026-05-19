import React, { useState, useEffect } from 'react';
import { User, Shield, Moon, Sun, LogOut, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [deleteConfirm, setDeleteConfirm] = useState('');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      alert('Please type DELETE to confirm account deletion.');
      return;
    }
    if (!window.confirm('FINAL WARNING: This will permanently delete your account and ALL your medical records. This action CANNOT be undone. Proceed?')) return;
    
    try {
      const res = await fetch('/api/auth/delete-account', { method: 'DELETE' });
      if (res.ok) {
        alert('Account deleted successfully.');
        window.location.href = '/login';
      } else {
        alert('Failed to delete account. Please try again.');
      }
    } catch (err) {
      alert('Error deleting account.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">System Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences and security configuration.</p>
      </div>

      <div className="space-y-6">
        {/* User Profile */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-sm"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <User size={40} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user?.email?.split('@')[0] || 'Patient'}</h3>
              <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold uppercase rounded-full tracking-wider">
                  Account Active
                </span>
                {user?.isAdmin && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase rounded-full tracking-wider">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Settings Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dark Mode Toggle */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                {darkMode ? <Moon className="text-purple-500" size={20} /> : <Sun className="text-amber-500" size={20} />}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">Appearance</h3>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-xs mb-4">Switch between light and dark themes.</p>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                darkMode 
                  ? 'bg-slate-900 border-slate-700 text-white' 
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <span className="text-sm font-semibold">{darkMode ? 'Dark Mode Enabled' : 'Light Mode Enabled'}</span>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
              </div>
            </button>
          </motion.div>

          {/* Security Info */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                <Shield className="text-indigo-500" size={20} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">Security</h3>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-xs mb-4">Your account security overview.</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <span className="text-sm text-slate-600 dark:text-slate-300">Password</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">Encrypted (bcrypt)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <span className="text-sm text-slate-600 dark:text-slate-300">Authentication</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">JWT Token</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <span className="text-sm text-slate-600 dark:text-slate-300">Database</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">Prisma ORM</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Danger Zone */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-rose-50 dark:bg-rose-950/30 rounded-3xl p-8 border border-rose-100 dark:border-rose-900 mt-6"
        >
          <h3 className="text-rose-900 dark:text-rose-400 font-bold text-lg mb-2 flex items-center gap-2">
            <Trash2 size={20} />
            Danger Zone
          </h3>
          <p className="text-rose-700 dark:text-rose-300 text-sm mb-6">Once you delete your account, there is no going back. Please be certain.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={logout}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-800 text-rose-600 rounded-xl text-sm font-bold border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
            >
              <LogOut size={16} /> Sign Out
            </button>
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder='Type "DELETE" to confirm'
                className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-white dark:placeholder-slate-400 text-slate-900"
              />
              <button 
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'DELETE'}
                className="px-6 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Delete Account
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
