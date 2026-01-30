'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import BusinessScanStep from '@/components/agent/BusinessScanStep';
import AIConsultantStep from '@/components/agent/AIConsultantStep';
import LaunchStep from '@/components/agent/LaunchStep';
import { Lock, Crown, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering for useSearchParams
export const dynamic = 'force-dynamic';

type Step = 1 | 2 | 3;

interface BusinessData {
  brandName: string;
  description: string;
  products?: string[];
  usps?: string[];
  visualStyle?: {
    logoUrl?: string;
    imageUrls?: string[];
  };
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
}

interface CampaignStrategy {
  objective: string;
  targeting: {
    ageMin: number;
    ageMax: number;
    genders: string[];
    locations: Array<{ name: string; type: string }>;
    interests: Array<{ id: string; name: string }>;
  };
  budget: {
    daily: number;
    currency: string;
  };
  adCopy: {
    headlines: string[];
    primaryTexts: string[];
    descriptions: string[];
    cta: string;
  };
  reasoning?: string;
}

interface SavedFlowState {
  currentStep: Step;
  taskId: string | null;
  businessData: BusinessData | null;
  strategy: CampaignStrategy | null;
  timestamp: number;
}

const FLOW_STATE_KEY = 'agent_flow_state';
const STATE_EXPIRY_HOURS = 6; // Expire after 6 hours

function AgentPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedFormId = searchParams.get('formId');
  const { isAuthenticated, user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [strategy, setStrategy] = useState<CampaignStrategy | null>(null);

  // Check if user has GROWTH plan
  const plan = user?.plan || 'FREE';
  const hasAccess = plan === 'GROWTH';

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/sign-in?redirect=/agent');
    }
  }, [isAuthenticated, router]);

  // Show locked state if user doesn't have GROWTH plan
  if (isAuthenticated && !hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center border-2 border-purple-100">
          {/* Lock Icon */}
          <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-purple-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            AI Agent is a GROWTH Feature
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8">
            Unlock AI-powered ad creation that automatically generates high-performing campaigns based on your business data.
          </p>

          {/* Features List */}
          <div className="bg-purple-50 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              What you get with GROWTH:
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">AI-Powered Campaign Creation</p>
                  <p className="text-sm text-gray-600">Let AI analyze your business and create optimized ad strategies</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">25 Campaigns per Month</p>
                  <p className="text-sm text-gray-600">10x more campaigns than FREE plan</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Smart Ad Copy Generation</p>
                  <p className="text-sm text-gray-600">Get 3 variants of headlines, texts, and CTAs</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Advanced Targeting</p>
                  <p className="text-sm text-gray-600">AI recommends best audiences for your ads</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Current Plan Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full mb-6">
            <span className="text-sm text-gray-600">Your plan:</span>
            <span className="font-bold text-gray-900">{plan}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/billing"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Crown className="w-5 h-5" />
              Upgrade to GROWTH
            </Link>
            <Link
              href="/templates"
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              Use Templates Instead
            </Link>
          </div>

          {/* Help Text */}
          <p className="text-sm text-gray-500 mt-6">
            Or continue with manual template-based ad creation available on your {plan} plan
          </p>
        </div>
      </div>
    );
  }

  // Auto-restore state from localStorage on mount (Projects page now handles draft choice)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    try {
      const savedState = localStorage.getItem(FLOW_STATE_KEY);
      if (savedState) {
        const parsed: SavedFlowState = JSON.parse(savedState);
        
        // Check if state is not expired (6 hours)
        const hoursElapsed = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
        if (hoursElapsed < STATE_EXPIRY_HOURS) {
          // Restore state automatically (user came from Projects or Create Ad cleared it)
          setCurrentStep(parsed.currentStep);
          setTaskId(parsed.taskId);
          setBusinessData(parsed.businessData);
          setStrategy(parsed.strategy);
        } else {
          // Expired, clear it
          localStorage.removeItem(FLOW_STATE_KEY);
        }
      }
    } catch (error) {
      console.error('❌ [Flow] Error restoring state:', error);
      localStorage.removeItem(FLOW_STATE_KEY);
    }
  }, [isAuthenticated]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!isAuthenticated) return;
    
    if (currentStep > 1) {
      const stateToSave: SavedFlowState = {
        currentStep,
        taskId,
        businessData,
        strategy,
        timestamp: Date.now(),
      };
      localStorage.setItem(FLOW_STATE_KEY, JSON.stringify(stateToSave));

    }
  }, [currentStep, taskId, businessData, strategy, isAuthenticated]);

  const handleBusinessScanComplete = (data: BusinessData, id: string) => {
    setBusinessData(data);
    setTaskId(id);
    setCurrentStep(2);
  };

  const handleStrategyComplete = (strategyData: CampaignStrategy) => {
    setStrategy(strategyData);
    setCurrentStep(3);
  };

  const handleLaunchComplete = () => {
    // Clear saved state on successful completion
    localStorage.removeItem(FLOW_STATE_KEY);
    console.log('🎉 [Flow] Campaign launched! State cleared');
    // Show success and redirect to tasks page
    router.push('/agent/tasks');
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    } else {
      // Clear state when going back to dashboard
      localStorage.removeItem(FLOW_STATE_KEY);
      console.log('🔙 [Flow] Returned to dashboard - State cleared');
      router.push('/dashboard');
    }
  };

  // Don't render until auth is checked
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step Content */}
        {currentStep === 1 && (
          <BusinessScanStep onComplete={handleBusinessScanComplete} />
        )}

        {currentStep === 2 && taskId && businessData && (
          <AIConsultantStep
            taskId={taskId}
            businessData={businessData}
            onComplete={handleStrategyComplete}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && taskId && businessData && strategy && (
          <LaunchStep
            taskId={taskId}
            businessData={businessData}
            strategy={strategy}
            preselectedFormId={preselectedFormId || undefined}
            onComplete={handleLaunchComplete}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}

export default function AgentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    }>
      <AgentPageInner />
    </Suspense>
  );
}
