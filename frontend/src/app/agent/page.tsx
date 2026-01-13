'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
const STATE_EXPIRY_HOURS = 24; // Expire after 24 hours

export default function AgentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [strategy, setStrategy] = useState<CampaignStrategy | null>(null);
  const [isRestored, setIsRestored] = useState(false);

  // Restore state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(FLOW_STATE_KEY);
      if (savedState) {
        const parsed: SavedFlowState = JSON.parse(savedState);
        
        // Check if state is not expired (24 hours)
        const hoursElapsed = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
        if (hoursElapsed < STATE_EXPIRY_HOURS) {
          // Restore state
          setCurrentStep(parsed.currentStep);
          setTaskId(parsed.taskId);
          setBusinessData(parsed.businessData);
          setStrategy(parsed.strategy);
          setIsRestored(true);
          console.log('✅ [Flow] Restored from step:', parsed.currentStep);
        } else {
          // Expired, clear it
          localStorage.removeItem(FLOW_STATE_KEY);
          console.log('⏰ [Flow] Expired state cleared');
        }
      }
    } catch (error) {
      console.error('❌ [Flow] Error restoring state:', error);
      localStorage.removeItem(FLOW_STATE_KEY);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isRestored || currentStep > 1) {
      const stateToSave: SavedFlowState = {
        currentStep,
        taskId,
        businessData,
        strategy,
        timestamp: Date.now(),
      };
      localStorage.setItem(FLOW_STATE_KEY, JSON.stringify(stateToSave));
      console.log('💾 [Flow] State saved - Step:', currentStep);
    }
  }, [currentStep, taskId, businessData, strategy, isRestored]);

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
              <div
                className={`flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-400 ${
                  currentStep >= 2
                    ? 'bg-gradient-to-br from-coral-500 to-purple-600 border-coral-500 text-white shadow-lg'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {currentStep > 2 ? (
                  <Check className="w-7 h-7" />
                ) : (
                  <Target className="w-7 h-7" />
                )}
              </div>
              <div className="flex-1 ml-4">
                <p className={`text-base font-bold ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>AI Strategy</p>
                <p className="text-sm text-gray-500">~20 seconds</p>
                {currentStep === 2 && (
                  <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-coral-500 to-purple-600 rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                )}
              </div>
            </div>

            {/* Step 3 - Mobile */}
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-400 ${
                  currentStep >= 3
                    ? 'bg-gradient-to-br from-coral-500 to-purple-600 border-coral-500 text-white shadow-lg'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                <Rocket className="w-7 h-7" />
              </div>
              <div className="flex-1 ml-4">
                <p className={`text-base font-bold ${currentStep >= 3 ? 'text-gray-900' : 'text-gray-500'}`}>Launch</p>
                <p className="text-sm text-gray-500">~20 seconds</p>
                {currentStep === 3 && (
                  <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-coral-500 to-purple-600 rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: Horizontal Progress */}
        <div className="hidden md:flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            {/* Step 1 */}
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  currentStep >= 1
                    ? 'bg-gradient-to-br from-coral-500 to-purple-600 border-coral-500 text-white shadow-lg scale-110'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {currentStep > 1 ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <Sparkles className={`w-6 h-6 ${currentStep === 1 ? '' : 'text-gray-400'}`} />
                )}
              </div>
              <div className="ml-3 text-left">
                <p className={`text-sm font-semibold ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>Scan Business</p>
                <p className="text-xs text-gray-500">~90 seconds</p>
              </div>
            </div>

            {/* Animated Connector 1-2 */}
            <div className="relative w-24 h-1">
              <div className="absolute inset-0 bg-gray-200 rounded-full" />
              <div
                className={`absolute inset-0 bg-gradient-to-r from-coral-500 to-purple-600 rounded-full transition-all duration-700 ${
                  currentStep >= 2 ? 'w-full' : 'w-0'
                }`}
              />
            </div>

            {/* Step 2 */}
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  currentStep >= 2
                    ? 'bg-gradient-to-br from-coral-500 to-purple-600 border-coral-500 text-white shadow-lg scale-110'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {currentStep > 2 ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <Target className={`w-6 h-6 ${currentStep === 2 ? '' : 'text-gray-400'}`} />
                )}
              </div>
              <div className="ml-3 text-left">
                <p className={`text-sm font-semibold ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>AI Strategy</p>
                <p className="text-xs text-gray-500">~20 seconds</p>
              </div>
            </div>

            {/* Animated Connector 2-3 */}
            <div className="relative w-24 h-1">
              <div className="absolute inset-0 bg-gray-200 rounded-full" />
              <div
                className={`absolute inset-0 bg-gradient-to-r from-coral-500 to-purple-600 rounded-full transition-all duration-700 ${
                  currentStep >= 3 ? 'w-full' : 'w-0'
                }`}
              />
            </div>

            {/* Step 3 */}
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  currentStep >= 3
                    ? 'bg-gradient-to-br from-coral-500 to-purple-600 border-coral-500 text-white shadow-lg scale-110'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                <Rocket className="w-6 h-6" />
              </div>
              <div className="ml-3 text-left">
                <p className={`text-sm font-semibold ${currentStep >= 3 ? 'text-gray-900' : 'text-gray-500'}`}>Launch</p>
                <p className="text-xs text-gray-500">~20 seconds</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto pb-20">
          {currentStep === 1 && (
            <BusinessScanStep onComplete={handleBusinessScanComplete} />
          )}
          {currentStep === 2 && taskId && businessData && (
            <AIConsultantStep
              taskId={taskId}
              businessData={businessData}
              onComplete={handleStrategyComplete}
              onBack={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 3 && taskId && strategy && businessData && (
            <LaunchStep
              taskId={taskId}
              strategy={strategy}
              businessData={businessData}
              onComplete={handleLaunchComplete}
              onBack={() => setCurrentStep(2)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
