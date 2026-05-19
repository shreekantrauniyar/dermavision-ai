import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Stethoscope, Loader2, Mail, Lock, UserCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function LoginPage() {
  const { user, login, signup } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  if (user) return <Navigate to="/" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signingIn || !email || !password) return;
    
    setSigningIn(true);
    setError(null);
    try {
      if (isSignUp) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "Failed to authenticate. Please try again.");
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-200 mb-6 font-bold text-2xl">
            DV
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">DermaVision AI</h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            Revolutionizing skin health with precision AI diagnostics and personalized care.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={signingIn}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-md shadow-indigo-100 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {signingIn ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <UserCircle size={18} />
              )}
              {signingIn ? "Please wait..." : (isSignUp ? "Create Account" : "Sign In")}
            </button>
          </form>

          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-xs font-semibold text-center border border-rose-100">
              {error}
            </div>
          )}

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-400 font-bold tracking-widest leading-none py-1">Security Promise</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
              <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full"></div>
              <span>End-to-end encrypted medical records</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
              <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full"></div>
              <span>HIPAA compliant data storage</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8 leading-relaxed max-w-sm mx-auto">
          By signing in you agree to our Terms of Service and Privacy Policy. 
          DermaVision is an AI assistant, not a substitute for clinical judgment.
        </p>
      </motion.div>
    </div>
  );
}
