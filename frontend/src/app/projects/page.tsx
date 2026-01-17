'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Folder, Clock, Trash2, Play, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface SavedFlowState {
  currentStep: number;
  taskId: string | null;
  businessData: any;
  strategy: any;
  timestamp: number;
}

export default function ProjectsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [draft, setDraft] = useState<SavedFlowState | null>(null);
  const [draftAge, setDraftAge] = useState<string>('');

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/sign-in?redirect=/projects');
    }
  }, [isAuthenticated, router]);

  // Load draft from localStorage
  useEffect(() => {
    if (!isAuthenticated) return;

    const savedState = localStorage.getItem('agent_flow_state');
    if (savedState) {
      try {
        const parsed: SavedFlowState = JSON.parse(savedState);
        
        // Check if draft is still valid (< 6 hours)
        const hoursElapsed = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
        if (hoursElapsed < 6) {
          setDraft(parsed);
          
          // Calculate human-readable age
          const minutesElapsed = Math.floor(hoursElapsed * 60);
          if (minutesElapsed < 60) {
            setDraftAge(`${minutesElapsed} minute${minutesElapsed !== 1 ? 's' : ''} ago`);
          } else {
            const hours = Math.floor(hoursElapsed);
            setDraftAge(`${hours} hour${hours !== 1 ? 's' : ''} ago`);
          }
        } else {
          // Expired draft, remove it
          localStorage.removeItem('agent_flow_state');
        }
      } catch (error) {
        console.error('Error loading draft:', error);
        localStorage.removeItem('agent_flow_state');
      }
    }
  }, [isAuthenticated]);

  const handleResumeDraft = () => {
    router.push('/agent');
  };

  const handleDeleteDraft = () => {
    localStorage.removeItem('agent_flow_state');
    setDraft(null);
    toast.success('Draft deleted');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500"></div>
      </div>
    );
  }

  const getStepName = (step: number) => {
    switch (step) {
      case 1: return 'Business Scan';
      case 2: return 'AI Strategy';
      case 3: return 'Launch Review';
      default: return `Step ${step}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50/30 via-mint-50/20 to-white pb-20 lg:pb-8">
      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-coral-100 px-4 py-4">
        <h1 className="text-xl font-bold text-charcoal-900">Projects</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Desktop Header */}
        <div className="hidden lg:block mb-8">
          <h1 className="text-3xl font-bold text-charcoal-900 mb-2">Projects</h1>
          <p className="text-charcoal-600">Manage your draft ad campaigns</p>
        </div>

        {/* Draft Card */}
        {draft ? (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-coral-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coral-500 to-coral-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-charcoal-900 mb-1">
                    Draft Campaign
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-charcoal-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {draftAge}
                    </span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded-full bg-mint-100 text-mint-700 font-medium">
                      {getStepName(draft.currentStep)}
                    </span>
                  </div>
                  
                  {draft.businessData?.businessName && (
                    <p className="text-sm text-charcoal-700 mb-4">
                      <span className="font-medium">Business:</span> {draft.businessData.businessName}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleResumeDraft}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-coral-500 to-coral-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                    >
                      <Play className="w-4 h-4" />
                      Resume Draft
                    </button>
                    <button
                      onClick={handleDeleteDraft}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Folder className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-charcoal-900 mb-2">No Draft Projects</h3>
            <p className="text-charcoal-600 mb-6">
              You don't have any saved drafts. Start creating a new ad campaign!
            </p>
            <button
              onClick={() => router.push('/agent')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-coral-500 to-coral-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Create New Ad
            </button>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-6 bg-mint-50 border border-mint-200 rounded-xl p-4">
          <h4 className="font-semibold text-charcoal-900 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-mint-600" />
            About Drafts
          </h4>
          <p className="text-sm text-charcoal-600">
            Drafts are automatically saved as you progress through the ad creation flow. 
            They expire after 6 hours of inactivity.
          </p>
        </div>
      </div>
    </div>
  );
}
