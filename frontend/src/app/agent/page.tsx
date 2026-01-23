'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import BusinessScanStep from '@/components/agent/BusinessScanStep';
import AIConsultantStep from '@/components/agent/AIConsultantStep';
import LaunchStep from '@/components/agent/LaunchStep';

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

export default function AgentPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [strategy, setStrategy] = useState<CampaignStrategy | null>(null);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/sign-in?redirect=/agent');
    }
  }, [isAuthenticated, router]);

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500"></div>
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
            onComplete={handleLaunchComplete}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}
