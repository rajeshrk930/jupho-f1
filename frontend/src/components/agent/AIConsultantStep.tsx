'use client';

import { useState, useEffect } from 'react';
import { Loader2, Sparkles, Target, Users, DollarSign, Edit2, Check, ArrowRight } from 'lucide-react';
import { agentApi } from '@/lib/api';
import PrimaryButton from '@/components/ui/PrimaryButton';
import BudgetSlider from '@/components/ui/BudgetSlider';

interface BusinessData {
  brandName: string;
  description: string;
  products?: string[];
  usps?: string[];
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

interface Props {
  taskId: string;
  businessData: BusinessData;
  onComplete: (strategy: CampaignStrategy) => void;
  onBack: () => void;
}

export default function AIConsultantStep({ taskId, businessData, onComplete, onBack }: Props) {
  const [strategy, setStrategy] = useState<CampaignStrategy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userGoal, setUserGoal] = useState('');
  const [editingGoal, setEditingGoal] = useState(false);
  const [conversionMethod, setConversionMethod] = useState<'lead_form' | 'website'>('lead_form');
  const [showingMethodSelector, setShowingMethodSelector] = useState(true);
  const [objective, setObjective] = useState<'TRAFFIC' | 'LEADS' | 'SALES'>('LEADS');
  const [budget, setBudget] = useState<number>(1000);
  const [showingObjectiveBudget, setShowingObjectiveBudget] = useState(false);

  const normalizeStrategyResponse = (response: any): CampaignStrategy => {
    const raw = response?.strategy || response;
    const ageRange = raw?.targeting?.ageRange;
    const [ageMinStr, ageMaxStr] = typeof ageRange === 'string' ? ageRange.split('-') : [];

    const ageMin = Number(ageMinStr) || raw?.targeting?.ageMin || 18;
    const ageMax = Number(ageMaxStr) || raw?.targeting?.ageMax || 45;

    const interestsRaw = raw?.targeting?.interests || raw?.targeting?.interestKeywords || [];
    const interests = Array.isArray(interestsRaw)
      ? interestsRaw.map((interest: any, idx: number) =>
          typeof interest === 'string'
            ? { id: `${idx}`, name: interest }
            : { id: interest.id || `${idx}`, name: interest.name || String(interest) }
        )
      : [];

    const locations = Array.isArray(raw?.targeting?.locations) && raw.targeting.locations.length > 0
      ? raw.targeting.locations
      : [{ name: raw?.targeting?.location || 'India', type: raw?.targeting?.isLocal ? 'local' : 'country' }];

    return {
      objective: raw?.objective || 'Lead Generation',
      targeting: {
        ageMin,
        ageMax,
        genders: Array.isArray(raw?.targeting?.genders) && raw.targeting.genders.length > 0
          ? raw.targeting.genders
          : ['All'],
        locations,
        interests,
      },
      budget: {
        daily: raw?.budget?.daily ?? raw?.budget?.dailyAmount ?? 500,
        currency: raw?.budget?.currency || 'INR',
      },
      adCopy: {
        headlines: raw?.adCopy?.headlines || [],
        primaryTexts: raw?.adCopy?.primaryTexts || [],
        descriptions: raw?.adCopy?.descriptions || [],
        cta: raw?.adCopy?.cta || 'Learn More',
      },
      reasoning: raw?.reasoning || raw?.budget?.reasoning,
    };
  };

  useEffect(() => {
    // Don't auto-generate - wait for user to select conversion method
  }, []);

  const handleStartGeneration = () => {
    setShowingMethodSelector(false);
    setShowingObjectiveBudget(true);
  };

  const handleGenerateWithPreferences = () => {
    setShowingObjectiveBudget(false);
    generateStrategy();
  };

  const generateStrategy = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await agentApi.generateStrategy(
        taskId, 
        userGoal || undefined, 
        conversionMethod,
        objective,
        budget
      );
      setStrategy(normalizeStrategyResponse(response));
    } catch (err: any) {
      const rawError = err.response?.data?.error || err.message || 'Failed to generate strategy.';
      
      // Hide technical details and show user-friendly messages
      let userFriendlyError = 'Failed to generate strategy. Please try again.';
      
      if (rawError.includes('429') || rawError.includes('Rate limit') || rawError.includes('rate limit')) {
        userFriendlyError = 'Our AI is currently experiencing high demand. Please wait 30 seconds and try again.';
      } else if (rawError.includes('timeout') || rawError.includes('timed out')) {
        userFriendlyError = 'The request took too long. Please try again.';
      } else if (rawError.includes('network') || rawError.includes('Network')) {
        userFriendlyError = 'Network error. Please check your connection and try again.';
      }
      
      setError(userFriendlyError);
      console.error('Strategy generation error:', rawError);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    generateStrategy();
  };

  const handleContinue = () => {
    if (strategy) {
      onComplete(strategy);
    }
  };

  if (showingObjectiveBudget) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 sm:p-12 max-w-4xl mx-auto">
        {/* Budget Slider */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-4">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Set Your Daily Ad Budget
            </h2>
            <p className="text-gray-600">AI will optimize for maximum leads within this budget.</p>
          </div>

          <BudgetSlider
            value={budget}
            onChange={setBudget}
            min={100}
            max={5000}
            currency="₹"
          />
        </div>

        <div className="flex gap-4">
          <PrimaryButton
            onClick={handleGenerateWithPreferences}
            variant="primary"
            size="lg"
            className="flex-1"
            icon={<Sparkles className="w-5 h-5" />}
          >
            Generate AI Strategy
          </PrimaryButton>
        </div>
      </div>
    );
  }

  if (showingMethodSelector) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 sm:p-12 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-coral-50 rounded-full mb-4">
            <Target className="w-8 h-8 text-coral-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">AI Campaign Setup (Auto-Configured)</h2>
          <p className="text-gray-600">Chosen because Instant Forms convert better for service businesses.</p>
        </div>

        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Objective</p>
                <p className="font-semibold text-gray-900">Leads</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">Locked</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Lead Type</p>
                <p className="font-semibold text-gray-900">Meta Instant Form</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">Locked</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Optimization</p>
                <p className="font-semibold text-gray-900">Lowest cost per lead</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">Locked</span>
          </div>
        </div>

        <div className="flex gap-4">
          <PrimaryButton
            onClick={handleStartGeneration}
            variant="primary"
            size="lg"
            className="flex-1"
            icon={<ArrowRight className="w-5 h-5" />}
          >
            Continue
          </PrimaryButton>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white to-coral-50/30 rounded-3xl shadow-xl border border-coral-100 p-12 text-center relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-coral-500/5 via-mint-500/5 to-coral-400/5 animate-pulse" />
        
        <div className="relative z-10">
          {/* Animated brain icon with glow effect */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-coral-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-coral-500 rounded-full shadow-sm">
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-1">Creating your Meta lead campaign</h3>
          <p className="text-gray-600 mb-8 text-lg">Selecting audience, copy, and structure</p>

          {/* Animated progress bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-coral-500 rounded-full animate-loading" 
                   style={{ width: '70%' }} />
            </div>
          </div>

          {/* Status steps with checkmarks */}
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex items-center text-sm bg-white/80 backdrop-blur rounded-lg px-4 py-3 shadow-sm border border-coral-100 transform transition-all hover:scale-105">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-700 font-medium">Campaign objective selected</span>
            </div>
            
            <div className="flex items-center text-sm bg-white/80 backdrop-blur rounded-lg px-4 py-3 shadow-sm border border-coral-100 transform transition-all hover:scale-105">
              <div className="flex-shrink-0 w-8 h-8 bg-coral-500 rounded-full flex items-center justify-center mr-3 animate-pulse">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
              <span className="text-gray-700 font-medium">Finding target audience interests...</span>
            </div>
            
            <div className="flex items-center text-sm bg-white/60 backdrop-blur rounded-lg px-4 py-3 shadow-sm border border-gray-200">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                <Sparkles className="w-5 h-5 text-gray-400" />
              </div>
              <span className="text-gray-500">Generating ad copy variants...</span>
            </div>
          </div>

          {/* Trust signal */}
          <div className="mt-8 flex items-center justify-center space-x-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>AI-Powered • Secure & Private</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Something Went Wrong</h3>
          <p className="text-red-600 mb-4">{error}</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={generateStrategy}
            className="flex-1 py-3 bg-coral-500 text-white rounded-lg hover:bg-coral-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!strategy) return null;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-coral-500 via-mint-500 to-coral-600 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mr-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI-Generated Strategy</h2>
                <p className="text-white/90">Tailored for {businessData.brandName}</p>
              </div>
            </div>
          </div>

          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium">
            AI-Recommended Setup (editable)
          </div>

          {/* User Goal Input */}
          {editingGoal ? (
            <div className="mt-4 animate-slideDown">
              <input
                type="text"
                value={userGoal}
                onChange={(e) => setUserGoal(e.target.value)}
                placeholder="E.g., Get more coaching clients aged 30-50"
                className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white/50"
                autoFocus
              />
              <button
                onClick={() => {
                  setEditingGoal(false);
                  if (userGoal) generateStrategy();
                }}
                className="mt-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg transition-all text-sm font-medium"
              >
                Apply & Regenerate
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingGoal(true)}
              className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg transition-all flex items-center space-x-2"
            >
              <Edit2 className="w-4 h-4" />
              <span className="text-sm font-medium">Customize Goal</span>
            </button>
          )}
        </div>
      </div>

      {/* Strategy Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Objective */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mr-3">
              <Target className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Objective</h3>
          </div>
          <p className="text-2xl font-bold text-red-600 mb-2">{strategy.objective}</p>
          {strategy.reasoning && (
            <p className="text-sm text-gray-600">{strategy.reasoning}</p>
          )}
        </div>

        {/* Budget */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Daily Budget</h3>
          </div>
          <p className="text-2xl font-bold text-green-600 mb-2">
            {strategy.budget.currency} {strategy.budget.daily}
          </p>
          <p className="text-sm text-gray-600">Optimized for your business size</p>
        </div>
      </div>

      {/* Targeting */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-mint-50 rounded-xl flex items-center justify-center mr-3">
            <Users className="w-5 h-5 text-mint-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Target Audience</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Age Range</p>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900">{strategy.targeting.ageMin}</span>
              <span className="text-gray-400">-</span>
              <span className="text-xl font-bold text-gray-900">{strategy.targeting.ageMax}</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Gender</p>
            <span className="text-lg font-semibold text-gray-900">{strategy.targeting.genders.join(', ')}</span>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Location</p>
            <p className="font-medium text-gray-900">
              {strategy.targeting.locations[0]?.name || 'India'}
            </p>
          </div>
        </div>
        {strategy.targeting.interests.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Interests</p>
            <div className="flex flex-wrap gap-2">
              {strategy.targeting.interests.slice(0, 6).map((interest, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-mint-50 text-mint-700 text-sm font-medium rounded-lg"
                >
                  {interest.name}
                </span>
              ))}
              {strategy.targeting.interests.length > 6 && (
                <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg">
                  +{strategy.targeting.interests.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ad Copy Preview */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Ad Copy Variants</h3>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Headlines (3 variants)</p>
            <div className="space-y-2">
              {strategy.adCopy.headlines.map((h, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                  {i + 1}. {h}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Primary Text (3 variants)</p>
            <div className="space-y-2">
              {strategy.adCopy.primaryTexts.slice(0, 1).map((t, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                  {t.substring(0, 100)}...
                </div>
              ))}
              <p className="text-xs text-gray-500 mt-2">+ 2 more variants</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <PrimaryButton
          onClick={onBack}
          variant="outline"
          className="flex-1"
        >
          Back
        </PrimaryButton>
        <PrimaryButton
          onClick={handleRegenerate}
          variant="secondary"
          className="flex-1"
        >
          Try a Different Angle
        </PrimaryButton>
        <PrimaryButton
          onClick={handleContinue}
          variant="primary"
          className="flex-1"
          icon={<ArrowRight className="w-5 h-5" />}
        >
          Continue to Launch
        </PrimaryButton>
      </div>
    </div>
  );
}
