'use client';

import { useState } from 'react';
import { X, Zap, Check, Sparkles } from 'lucide-react';
import { paymentApi } from '@/lib/api';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeComplete: () => void;
}

export default function UpgradeModal({ isOpen, onClose, onUpgradeComplete }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'BASIC' | 'GROWTH'>('GROWTH');

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    setError('');

    try {
      const planName = selectedPlan === 'BASIC' ? 'BASIC_MONTHLY' : 'GROWTH_MONTHLY';
      const { orderId, subscriptionId, amount, currency, keyId, mode } = await paymentApi.createOrder(planName);

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'Jupho',
        description: selectedPlan === 'BASIC' ? 'Jupho Basic - Monthly Subscription' : 'Jupho Growth - Monthly Subscription',
        order_id: mode === 'order' ? orderId : undefined,
        subscription_id: mode === 'subscription' ? subscriptionId : undefined,
        handler: async (response: any) => {
          try {
            await paymentApi.verifyPayment({
              orderId: response.razorpay_order_id,
              subscriptionId: response.razorpay_subscription_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            onUpgradeComplete();
            onClose();
          } catch (err: any) {
            setError(err.response?.data?.error || 'Payment verification failed');
          }
        },
        prefill: {
          name: '',
          email: '',
        },
        theme: {
          color: '#3b82f6',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-charcoal-900 mb-2">
            Choose Your Plan
          </h2>
          <p className="text-charcoal-600">
            Unlock powerful features to grow your business
          </p>
        </div>

        {/* Plan Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* BASIC Plan */}
          <div 
            onClick={() => setSelectedPlan('BASIC')}
            className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
              selectedPlan === 'BASIC' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-charcoal-900">BASIC</h3>
              {selectedPlan === 'BASIC' && (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-charcoal-900">₹1,499</span>
                <span className="text-charcoal-600 ml-2">/month</span>
              </div>
              <p className="text-sm text-charcoal-600 mt-1">Perfect for getting started</p>
            </div>

            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-charcoal-700"><strong>10 campaigns/month</strong></span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-charcoal-700">Templates library (50+)</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-charcoal-700">Instant Lead Ads</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-charcoal-700">Leads dashboard</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-charcoal-700">Save & reuse templates</span>
              </li>
              <li className="flex items-start text-gray-400">
                <X className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                <span>AI Agent (Growth only)</span>
              </li>
            </ul>
          </div>

          {/* GROWTH Plan */}
          <div 
            onClick={() => setSelectedPlan('GROWTH')}
            className={`border-2 rounded-xl p-6 cursor-pointer transition-all relative ${
              selectedPlan === 'GROWTH' 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="absolute -top-3 right-6 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              RECOMMENDED
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-charcoal-900">GROWTH</h3>
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
              {selectedPlan === 'GROWTH' && (
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-charcoal-900">₹1,999</span>
                <span className="text-charcoal-600 ml-2">/month</span>
              </div>
              <p className="text-sm text-purple-600 font-medium mt-1">Best value for scaling</p>
            </div>

            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-charcoal-700"><strong>25 campaigns/month</strong></span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-charcoal-700"><strong>AI Agent (smart creation)</strong></span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-charcoal-700">AI-generated copy + strategy</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-charcoal-700">Everything in BASIC</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-charcoal-700">Priority support</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-charcoal-700">Future optimizer access</span>
              </li>
            </ul>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className={`w-full font-semibold py-4 px-6 rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            selectedPlan === 'GROWTH'
              ? 'bg-purple-500 hover:bg-purple-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {loading 
            ? 'Processing...' 
            : selectedPlan === 'GROWTH' 
            ? 'Get Growth Plan - ₹1,999/month' 
            : 'Get Basic Plan - ₹1,499/month'
          }
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Secure payment powered by Razorpay. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
