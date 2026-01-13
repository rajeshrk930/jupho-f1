'use client';

import { useState } from 'react';
import { X, Zap, Check } from 'lucide-react';
import { paymentApi } from '@/lib/api';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeComplete: () => void;
}

export default function UpgradeModal({ isOpen, onClose, onUpgradeComplete }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    setError('');

    try {
      const planName = selectedPlan === 'annual' ? 'PRO_ANNUAL' : 'PRO_MONTHLY';
      const { orderId, subscriptionId, amount, currency, keyId, mode } = await paymentApi.createOrder(planName);

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'Jupho',
        description: selectedPlan === 'annual' ? 'Jupho Pro - Annual Subscription' : 'Jupho Pro - Monthly Subscription',
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
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-coral-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-charcoal-900 mb-2">
            Upgrade to Jupho Pro
          </h2>
          <p className="text-charcoal-600">
            Unlock unlimited AI conversations and advanced features
          </p>
        </div>

        {/* Plan Toggle */}
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              selectedPlan === 'monthly'
                ? 'bg-white text-charcoal-900 shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedPlan('annual')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all relative ${
              selectedPlan === 'annual'
                ? 'bg-white text-charcoal-900 shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            Annual
            <span className="absolute -top-2 -right-2 bg-white text-coral-500 text-[10px] font-bold px-1.5 py-0.5 rounded-lg border border-coral-200">
              SAVE 17%
            </span>
          </button>
        </div>

        <div className="bg-coral-50 rounded-lg p-6 mb-6 border-2 border-coral-200">
          {selectedPlan === 'monthly' ? (
            <>
              <div className="flex items-baseline justify-center mb-4">
                <span className="text-4xl font-bold text-charcoal-900">₹1,999</span>
                <span className="text-charcoal-600 ml-2">/month</span>
              </div>
              <p className="text-center text-sm text-charcoal-600 mb-4">
                Billed monthly • ₹23,988/year
              </p>
            </>
          ) : (
            <>
              <div className="flex items-baseline justify-center mb-2">
                <span className="text-4xl font-bold text-charcoal-900">₹19,990</span>
                <span className="text-charcoal-600 ml-2">/year</span>
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-sm line-through text-gray-500">₹23,988</span>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
                  Save ₹3,998
                </span>
              </div>
              <p className="text-center text-sm text-coral-600 font-medium mb-4">
                Just ₹1,666/month • 2 months FREE!
              </p>
            </>
          )}

          <ul className="space-y-3">
            {[
              selectedPlan === 'monthly' ? '50 AI-created campaigns per month' : '600 AI-created campaigns per year',
              'Unlimited AI ad copy generation',
              'Advanced targeting recommendations',
              'Automatic campaign optimization',
              'Priority support',
            ].map((feature) => (
              <li key={feature} className="flex items-start">
                <Check className="w-5 h-5 text-coral-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-charcoal-600">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="bg-coral-500 hover:bg-coral-600 text-white font-semibold py-3 px-6 rounded-lg w-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : selectedPlan === 'annual' ? 'Get Annual Plan - ₹19,990' : 'Get Monthly Plan - ₹1,999'}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Secure payment powered by Razorpay. {selectedPlan === 'monthly' ? 'Cancel anytime.' : '30-day money-back guarantee.'}
        </p>
      </div>
    </div>
  );
}
