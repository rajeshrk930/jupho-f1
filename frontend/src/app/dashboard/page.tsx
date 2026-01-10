'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { agentApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { StatCard } from '@/components/StatCard';
import MobileTopBar from '@/components/MobileTopBar';
import { Sparkles, Target, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['agent-tasks'],
    queryFn: () => agentApi.getTasks(10),
  });

  const tasks = tasksData?.tasks || [];
  
  const completedTasks = tasks.filter((t: any) => t.status === 'COMPLETED').length;
  const failedTasks = tasks.filter((t: any) => t.status === 'FAILED').length;
  const pendingTasks = tasks.filter((t: any) => ['PENDING', 'GENERATING', 'CREATING'].includes(t.status)).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-coral-50">
      <MobileTopBar title="Dashboard" />
      <div className="px-4 lg:px-6 py-4 lg:py-6 space-y-6 pb-20 lg:pb-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hidden lg:block">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs text-coral-500 font-medium uppercase tracking-wider">Dashboard</p>
              <h1 className="text-2xl font-semibold text-charcoal-900">Welcome back{user?.name ? `, ${user.name}` : ''}!</h1>
              <p className="text-sm text-charcoal-600">Create high-performing Meta ads with AI</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/agent" className="bg-coral-500 hover:bg-coral-600 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2">
                <Sparkles size={16} />
                Create Ad with AI
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Completed Ads"
            value={completedTasks}
            icon={CheckCircle2}
            trend={completedTasks > 0 ? `${completedTasks} successful` : undefined}
          />
          <StatCard
            title="Active Tasks"
            value={pendingTasks}
            icon={Loader2}
            trend={pendingTasks > 0 ? 'In progress' : 'No active tasks'}
          />
          <StatCard
            title="Failed Tasks"
            value={failedTasks}
            icon={XCircle}
            trend={failedTasks > 0 ? 'Review errors' : 'All good'}
          />
        </div>

        {/* Quick Action */}
        <Link
          href="/agent"
          className="block bg-gradient-to-r from-coral-500 to-mint-500 rounded-2xl p-8 text-white hover:shadow-xl transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Sparkles size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Start Creating Ads with AI</h2>
              <p className="text-white/90">Let our AI agent guide you through creating high-performing Meta ads in minutes</p>
            </div>
          </div>
        </Link>

        {/* Recent Tasks */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-charcoal-900">Recent Tasks</h2>
            <Link href="/agent" className="text-sm text-coral-500 hover:text-coral-600 hover:underline">View all →</Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-coral-500" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 mx-auto mb-3 text-charcoal-400" />
              <p className="text-charcoal-600 mb-4">No tasks yet</p>
              <Link href="/agent" className="bg-coral-500 hover:bg-coral-600 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2">
                <Sparkles size={16} />
                Create Your First Ad
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      task.status === 'COMPLETED' ? 'bg-mint-100 text-mint-600' :
                      task.status === 'FAILED' ? 'bg-red-100 text-red-600' :
                      'bg-coral-100 text-coral-600'
                    }`}>
                      {task.status === 'COMPLETED' ? <CheckCircle2 size={20} /> :
                       task.status === 'FAILED' ? <XCircle size={20} /> :
                       <Loader2 size={20} className="animate-spin" />}
                    </div>
                    <div>
                      <p className="font-medium text-charcoal-900">
                        {task.input ? JSON.parse(task.input).objective || 'Ad Creation' : 'Ad Creation'}
                      </p>
                      <p className="text-sm text-charcoal-600 flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    task.status === 'COMPLETED' ? 'bg-mint-100 text-mint-700' :
                    task.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                    'bg-coral-100 text-coral-700'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-br from-coral-50 to-mint-50 rounded-2xl border border-coral-100 p-6">
          <h2 className="text-lg font-semibold text-charcoal-900 mb-2">How it works</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-charcoal-700">
            <div>
              <div className="font-medium mb-1">1. Answer Questions</div>
              <p className="text-charcoal-600">Tell our AI about your business, target audience, and budget</p>
            </div>
            <div>
              <div className="font-medium mb-1">2. Review AI-Generated Copy</div>
              <p className="text-charcoal-600">Get 3 variants of headlines, primary text, and descriptions</p>
            </div>
            <div>
              <div className="font-medium mb-1">3. Launch Your Ad</div>
              <p className="text-charcoal-600">Approve and create ads directly on Facebook in one click</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
