import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { ShieldAlert, Users, FileImage, Trash2, UserX } from 'lucide-react';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allScans, setAllScans] = useState<any[]>([]);

  useEffect(() => {
    // Only fetch if admin
    if (!user?.isAdmin) return;

    const fetchData = async () => {
      try {
        const [usersRes, scansRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/scans')
        ]);
        
        if (usersRes.ok) setAllUsers(await usersRes.json());
        if (scansRes.ok) setAllScans(await scansRes.json());
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      }
    };
    
    // Initial fetch
    fetchData();
    
    // Poll every 3 seconds for real-time updates
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const handleDeleteScan = async (scanId: string, userId: string) => {
    if (!window.confirm("WARNING: Are you sure you want to permanently delete this patient's scan?")) return;
    try {
      const res = await fetch(`/api/admin/scans/${scanId}`, { method: 'DELETE' });
      if (res.ok) {
        setAllScans(prev => prev.filter(s => s.id !== scanId));
      }
    } catch (err) {
      console.error("Failed to delete scan", err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("CRITICAL WARNING: Are you sure you want to BAN this user and permanently delete ALL their medical records? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setAllUsers(prev => prev.filter(u => u.uid !== userId));
        setAllScans(prev => prev.filter(s => s.userId !== userId));
      }
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 dark:text-slate-400">Loading admin dashboard...</div>;
  }

  if (!user?.isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="text-rose-500" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Full system control and patient management.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-100 dark:bg-indigo-900/50 p-4 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Registered Users</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{allUsers.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-100 dark:bg-emerald-900/50 p-4 rounded-xl text-emerald-600 dark:text-emerald-400">
            <FileImage size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Scans Processed</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{allScans.length}</p>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Users size={20} className="text-indigo-600 dark:text-indigo-400"/> User Management
          </h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
          {allUsers.length === 0 ? (
            <p className="p-6 text-slate-500 dark:text-slate-400 text-center text-sm">No users registered.</p>
          ) : (
            allUsers.map(u => (
              <div key={u.uid} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{u.email}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">ID: {u.uid}</p>
                </div>
                {u.email !== 'admin@dermavision.com' && (
                  <button 
                    onClick={() => handleDeleteUser(u.uid)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                  >
                    <UserX size={14} /> Ban User & Delete Data
                  </button>
                )}
                {u.email === 'admin@dermavision.com' && (
                  <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-lg">Admin</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Global Scan Feed Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FileImage size={20} className="text-emerald-600 dark:text-emerald-400"/> Global Patient Scans
          </h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {allScans.length === 0 ? (
            <p className="p-6 text-slate-500 dark:text-slate-400 text-center text-sm">No scans found in the system yet.</p>
          ) : (
            allScans.map(scan => {
              const scanOwner = allUsers.find(u => u.uid === scan.userId);
              return (
                <div key={scan.id} className="p-6 flex flex-col md:flex-row gap-6 items-start hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                  <img src={scan.imageUrl} alt="Scan" className="w-32 h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm" />
                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-xl">{scan.diseaseName}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-md">
                            Patient: {scanOwner ? scanOwner.email : scan.userId}
                          </span>
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-1 rounded-md">
                            {(scan.confidence * 100).toFixed(1)}% Confidence
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteScan(scan.id, scan.userId)}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all"
                      >
                        <Trash2 size={14} /> Delete Record
                      </button>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">{scan.treatment}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{new Date(scan.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
