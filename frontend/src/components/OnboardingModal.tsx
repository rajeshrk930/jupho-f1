'use client';

import { Crown, X, BookMarked, Sparkles, Check, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: string;
}

export default function OnboardingModal({ isOpen, onClose, plan = 'FREE' }: OnboardingModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleStartTemplates = () => {
    router.push('/templates');
    onClose();
  };

  const handleUpgrade = () => {
    router.push('/billing');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Jupho! 🎉
          </h2>
          <p className="text-gray-600">
            You're on the <span className="font-bold text-purple-600">{plan}</span> plan
          </p>
        </div>

        {/* FREE Plan Features */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Your FREE plan includes:</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">2 campaigns per month</p>
                <p className="text-sm text-gray-600">Perfect for testing the waters</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Template-based ads</p>
                <p className="text-sm text-gray-600">Quick creation with proven templates</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Facebook ad publishing</p>
                <p className="text-sm text-gray-600">Direct integration with Meta</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Agent Locked */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-1">
                Want AI-powered ad creation?
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Upgrade to <span className="font-bold text-purple-600">GROWTH</span> to unlock our AI Agent that creates high-performing ads automatically.
              </p>
              <div className="flex items-center gap-2 text-xs text-purple-600 font-medium">
                <Zap size={14} />
                <span>25 campaigns/month + AI Agent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleStartTemplates}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <BookMarked size={18} />
            Start with Templates
          </button>
          <button
            onClick={handleUpgrade}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Crown size={18} />
            Upgrade Now
          </button>
        </div>

        {/* Skip Link */}
        <div className="text-center mt-4">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            I'll explore on my own
          </button>
        </div>
      </div>
    </div>
  );
}
