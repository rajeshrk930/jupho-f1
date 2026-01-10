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
      <div className="bg-base-elevated rounded-md shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-signal-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Upgrade to Jupho Pro
          </h2>
          <p className="text-text-secondary">
            Unlock unlimited AI conversations and advanced features
          </p>
        </div>

        {/* Plan Toggle */}
        <div className="flex gap-2 bg-base-surface rounded-md p-1 mb-6">
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`flex-1 py-2.5 px-4 rounded-sm text-sm font-medium transition-all ${
              selectedPlan === 'monthly'
                ? 'bg-base-elevated text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedPlan('annual')}
            className={`flex-1 py-2.5 px-4 rounded-sm text-sm font-medium transition-all relative ${
              selectedPlan === 'annual'
                ? 'bg-base-elevated text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Annual
            <span className="absolute -top-2 -right-2 bg-base-elevated text-signal-primary text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
              SAVE 17%
            </span>
          </button>
        </div>

        <div className="bg-signal-primary/10 rounded-md p-6 mb-6 border-2 border-signal-primary/20">
          {selectedPlan === 'monthly' ? (
            <>
              <div className="flex items-baseline justify-center mb-4">
                <span className="text-4xl font-bold text-text-primary">₹1,999</span>
                <span className="text-text-secondary ml-2">/month</span>
              </div>
              <p className="text-center text-sm text-text-secondary mb-4">
                Billed monthly • ₹23,988/year
              </p>
            </>
          ) : (
            <>
              <div className="flex items-baseline justify-center mb-2">
                <span className="text-4xl font-bold text-gray-900">₹19,990</span>
                <span className="text-gray-600 ml-2">/year</span>
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-sm line-through text-gray-500">₹23,988</span>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
                  Save ₹3,998
                </span>
              </div>
              <p className="text-center text-sm text-signal-primary font-medium mb-4">
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
                <Check className="w-5 h-5 text-signal-primary mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-text-secondary">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <div className="bg-signal-danger/10 border border-signal-danger/20 text-signal-danger px-4 py-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="btn-primary w-full shadow-lg"
        >
          {loading ? 'Processing...' : selectedPlan === 'annual' ? 'Get Annual Plan - ₹19,990' : 'Get Monthly Plan - ₹1,999'}
        </button>

        <p className="text-xs text-text-tertiary text-center mt-4">
          Secure payment powered by Razorpay. {selectedPlan === 'monthly' ? 'Cancel anytime.' : '30-day money-back guarantee.'}
        </p>
      </div>
    </div>
  );
}
