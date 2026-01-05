'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

function SignupPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const ALLOWED_REDIRECTS = ['/dashboard', '/analyze', '/assistant', '/history', '/assistant/history'];
  const safeRedirect = redirectParam && ALLOWED_REDIRECTS.some((path) => redirectParam.startsWith(path))
    ? redirectParam
    : '/dashboard';
  const setAuth = useAuthStore((state) => state.setAuth);
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const response = await authApi.register(email, password, name);
      if (response.success) {
        // Backend sets httpOnly cookie; if a token is returned (dev fallback) store it
        setAuth(response.data.user, response.data.token ?? null);
        toast.success('Account created');
        // Use window.location for hard redirect to ensure state is updated
        window.location.href = safeRedirect;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated, redirect immediately to the requested page
  useEffect(() => {
    if (user) {
      window.location.href = safeRedirect;
    }
  }, [user, safeRedirect]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <UserPlus className="md:hidden text-white" size={24} />
            <UserPlus className="hidden md:block text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Get Started</h1>
          <p className="text-gray-600 mt-1">Create your account</p>
        </div>

        <div className="bg-white/90 backdrop-blur rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input pl-10"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-500">Loading...</div>}>
      <SignupPageInner />
    </Suspense>
  );
}
