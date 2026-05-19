import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="pl-64">
        <Navbar />
        <main className="p-8">
          {children}
        </main>
        <footer className="p-8 border-t border-gray-100 text-center text-gray-400 text-sm print:hidden">
          <p>&copy; 2026 DermaVision AI. All rights reserved. Precision Healthcare Diagnostics.</p>
        </footer>
      </div>
    </div>
  );
}
