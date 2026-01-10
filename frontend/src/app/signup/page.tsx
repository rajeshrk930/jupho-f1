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
  const ALLOWED_REDIRECTS = ['/agent', '/dashboard', '/analyze', '/templates', '/history'];
  const safeRedirect = redirectParam && ALLOWED_REDIRECTS.some((path) => redirectParam.startsWith(path))
    ? redirectParam
    : '/agent';
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
        // Store token in localStorage (cross-domain fix)
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }        setAuth(response.data.user, response.data.token ?? null);
        toast.success('Account created');
        // Use Next.js router for navigation
        router.push(safeRedirect);
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
      router.push(safeRedirect);
    }
  }, [user, safeRedirect, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-coral-50 to-mint-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-coral-500 to-mint-500 flex items-center justify-center shadow-sm">
            <UserPlus className="md:hidden text-white" size={24} />
            <UserPlus className="hidden md:block text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-charcoal-900">Get Started</h1>
          <p className="text-charcoal-600 mt-1">Create your account</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white text-charcoal-900 placeholder-charcoal-400"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white text-charcoal-900 placeholder-charcoal-400"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white text-charcoal-900 placeholder-charcoal-400"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <p className="text-xs text-charcoal-500 mt-1">At least 6 characters</p>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-3 px-4 bg-gradient-to-r from-coral-500 to-mint-500 hover:from-coral-600 hover:to-mint-600 text-white font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-charcoal-600 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-coral-500 hover:text-coral-600 font-medium">
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
    <Suspense fallback={<div className="p-8 text-sm text-charcoal-500">Loading...</div>}>
      <SignupPageInner />
    </Suspense>
  );
}
