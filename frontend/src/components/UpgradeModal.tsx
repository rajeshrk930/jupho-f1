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

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    setError('');

    try {
      const { orderId, amount, currency, keyId } = await paymentApi.createOrder();

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'Jupho',
        description: 'Jupho Pro - Monthly Subscription',
        order_id: orderId,
        handler: async (response: any) => {
          try {
            await paymentApi.verifyPayment({
              orderId: response.razorpay_order_id,
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Upgrade to Jupho Pro
          </h2>
          <p className="text-gray-600">
            Unlock unlimited AI conversations and advanced features
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
          <div className="flex items-baseline justify-center mb-4">
            <span className="text-4xl font-bold text-gray-900">₹999</span>
            <span className="text-gray-600 ml-2">/month</span>
          </div>

          <ul className="space-y-3">
            {[
              'Unlimited AI assistant questions',
              'Priority response time',
              'Advanced analysis features',
              'Export unlimited reports',
              'Email support',
            ].map((feature) => (
              <li key={feature} className="flex items-start">
                <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Upgrade Now'}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Secure payment powered by Razorpay. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
