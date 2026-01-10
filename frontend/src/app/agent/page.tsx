'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Zap, Rocket, Check, Target } from 'lucide-react';
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

export default function AgentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [strategy, setStrategy] = useState<CampaignStrategy | null>(null);

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
    // Show success and redirect to tasks page
    router.push('/agent/tasks');
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <div className="flex items-center">
              <Sparkles className="w-6 h-6 text-coral-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Agency-in-a-Box</h1>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Secured</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile-First Progress Steps */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Mobile: Vertical Progress */}
        <div className="block md:hidden mb-8">
          <div className="space-y-4">
            {/* Step 1 - Mobile */}
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-400 ${
                  currentStep >= 1
                    ? 'bg-gradient-to-br from-coral-500 to-purple-600 border-coral-500 text-white shadow-lg'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {currentStep > 1 ? (
                  <Check className="w-7 h-7" />
                ) : (
                  <Sparkles className="w-7 h-7" />
                )}
              </div>
              <div className="flex-1 ml-4">
                <p className={`text-base font-bold ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>Scan Business</p>
                <p className="text-sm text-gray-500">~90 seconds</p>
                {currentStep === 1 && (
                  <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-coral-500 to-purple-600 rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                )}
              </div>
            </div>

            {/* Step 2 - Mobile */}
            <div className="flex items-center">
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
