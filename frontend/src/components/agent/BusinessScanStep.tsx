'use client';

import { useState } from 'react';
import { Loader2, Globe, Instagram, FileText, Sparkles, CheckCircle, Package, Zap, Mail, Phone, Image } from 'lucide-react';
import { agentApi } from '@/lib/api';

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

interface Props {
  onComplete: (data: BusinessData, taskId: string) => void;
}

type InputMode = 'url' | 'manual';
type ViewMode = 'input' | 'preview';

export default function BusinessScanStep({ onComplete }: Props) {
  const [mode, setMode] = useState<InputMode>('url');
  const [viewMode, setViewMode] = useState<ViewMode>('input');
  const [url, setUrl] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scannedData, setScannedData] = useState<BusinessData | null>(null);
  const [taskId, setTaskId] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await agentApi.startBusinessScan({
        url: mode === 'url' ? url : undefined,
        manualInput: mode === 'manual' ? manualInput : undefined,
      });

      setScannedData(response.businessData);
      setTaskId(response.taskId);
      setViewMode('preview');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to scan business. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (scannedData && taskId) {
      onComplete(scannedData, taskId);
    }
  };

  const handleBack = () => {
    setViewMode('input');
    setScannedData(null);
    setTaskId('');
  };

  const isValid = mode === 'url' ? url.trim().length > 0 : manualInput.trim().length > 20;

  if (viewMode === 'preview' && scannedData) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Scan Complete!</h2>
          <p className="text-gray-600">
            Here's what we found about your business. Review and continue.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {/* Brand Name */}
          <div className="p-4 bg-coral-50 border border-coral-200 rounded-lg">
            <div className="flex items-start">
              <Sparkles className="w-5 h-5 text-coral-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-coral-900 mb-1">Brand Name</h3>
                <p className="text-lg font-bold text-gray-900">{scannedData.brandName}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {scannedData.description && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">Business Description</h3>
                  <p className="text-sm text-gray-700">{scannedData.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Products */}
          {scannedData.products && scannedData.products.length > 0 && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start">
                <Package className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-purple-900 mb-2">
                    Products/Services <span className="text-xs font-normal text-purple-600">({scannedData.products.length} found)</span>
                  </h3>
                  <ul className="space-y-1">
                    {scannedData.products.map((product, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start">
                        <span className="text-purple-600 mr-2">•</span>
                        <span>{product}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* USPs */}
          {scannedData.usps && scannedData.usps.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start">
                <Zap className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-amber-900 mb-2">Unique Selling Points</h3>
                  <ul className="space-y-1">
                    {scannedData.usps.map((usp, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start">
                        <CheckCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{usp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Contact Info */}
          {(scannedData.contact?.email || scannedData.contact?.phone) && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Contact Information</h3>
              <div className="space-y-2">
                {scannedData.contact.email && (
                  <div className="flex items-center text-sm text-gray-700">
                    <Mail className="w-4 h-4 text-gray-500 mr-2" />
                    <span>{scannedData.contact.email}</span>
                  </div>
                )}
                {scannedData.contact.phone && (
                  <div className="flex items-center text-sm text-gray-700">
                    <Phone className="w-4 h-4 text-gray-500 mr-2" />
                    <span>{scannedData.contact.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Images */}
          {scannedData.visualStyle?.imageUrls && scannedData.visualStyle.imageUrls.length > 0 && (
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <div className="flex items-start mb-3">
                <Image className="w-5 h-5 text-indigo-600 mt-0.5 mr-3 flex-shrink-0" />
                <h3 className="text-sm font-semibold text-indigo-900">
                  Extracted Images <span className="text-xs font-normal text-indigo-600">({scannedData.visualStyle.imageUrls.length} found)</span>
                </h3>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {scannedData.visualStyle.imageUrls.slice(0, 8).map((imgUrl, idx) => (
                  <div key={idx} className="aspect-square bg-white rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={imgUrl}
                      alt={`Business image ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif" font-size="12"%3EImage%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleBack}
            className="flex-1 py-4 bg-white text-coral-600 font-semibold rounded-lg border-2 border-coral-500 hover:bg-coral-50 transition-colors"
          >
            Scan Again
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 py-4 bg-coral-500 text-white font-semibold rounded-lg hover:bg-coral-600 transition-colors flex items-center justify-center"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Continue to Strategy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-coral-100 p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-coral-50 rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-coral-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell Us About Your Business</h2>
        <p className="text-gray-600">
          We'll scan your website or Instagram to understand your brand automatically
        </p>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
            mode === 'url'
              ? 'border-coral-500 bg-coral-50 text-coral-900'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }`}
        >
          <Globe className="w-5 h-5 mx-auto mb-1" />
          <span className="text-sm font-medium">Website / Instagram URL</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
            mode === 'manual'
              ? 'border-coral-500 bg-coral-50 text-coral-900'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }`}
        >
          <FileText className="w-5 h-5 mx-auto mb-1" />
          <span className="text-sm font-medium">Describe Manually</span>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {mode === 'url' ? (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website or Instagram URL
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com or https://instagram.com/username"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              We'll automatically extract your brand name, products, and visual style
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe Your Business
            </label>
            <textarea
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Example: We sell handmade organic soaps for sensitive skin. Our products are vegan, cruelty-free, and made with natural ingredients like lavender and tea tree oil. Target customers are health-conscious women aged 25-45."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent resize-none"
              disabled={loading}
            />
            <p className="mt-2 text-xs text-gray-500">
              Include your business name, products/services, and target audience (min. 20 characters)
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!isValid || loading}
          className="w-full py-4 bg-coral-500 text-white font-semibold rounded-lg hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Scanning... (~90 seconds)
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Scan & Continue
            </>
          )}
        </button>
      </form>

      {/* Example Section */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-xs font-medium text-gray-700 mb-2">💡 What we extract:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Brand name and description</li>
          <li>• Products/services offered</li>
          <li>• Unique selling points (USPs)</li>
          <li>• Visual style and branding</li>
          <li>• Contact information</li>
        </ul>
      </div>
    </div>
  );
}
