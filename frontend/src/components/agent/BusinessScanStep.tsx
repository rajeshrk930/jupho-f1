'use client';

import { useState, useEffect } from 'react';
import { Loader2, Globe, Instagram, FileText, Sparkles, CheckCircle, Package, Zap, Mail, Phone, Image, Link as LinkIcon, User } from 'lucide-react';
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

type ScanStep = {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: 'pending' | 'in-progress' | 'complete';
};

export default function BusinessScanStep({ onComplete }: Props) {
  const [mode, setMode] = useState<InputMode>('url');
  const [viewMode, setViewMode] = useState<ViewMode>('input');
  const [url, setUrl] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scannedData, setScannedData] = useState<BusinessData | null>(null);
  const [taskId, setTaskId] = useState<string>('');
  const [scanSteps, setScanSteps] = useState<ScanStep[]>([
    {
      id: 'parsing',
      title: 'Parsing URL',
      description: 'Connecting to your website and validating the URL',
      icon: LinkIcon,
      status: 'pending',
    },
    {
      id: 'brand',
      title: 'Extracting Brand Info',
      description: 'Identifying your brand name and business description',
      icon: Sparkles,
      status: 'pending',
    },
    {
      id: 'products',
      title: 'Identifying Products',
      description: 'Discovering your products, services, and offerings',
      icon: Package,
      status: 'pending',
    },
    {
      id: 'usps',
      title: 'Analyzing Selling Points',
      description: 'Finding your unique competitive advantages and USPs',
      icon: Zap,
      status: 'pending',
    },
    {
      id: 'visuals',
      title: 'Gathering Visuals',
      description: 'Extracting images, colors, and brand visual style',
      icon: Image,
      status: 'pending',
    },
  ]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepDetails, setStepDetails] = useState<string>('');

  // Simulate progress through steps
  useEffect(() => {
    if (!loading) return;

    const stepTimings = [
      { index: 0, delay: 500, duration: 8000 },    // Parsing URL: 0-8s
      { index: 1, delay: 8500, duration: 15000 },  // Brand Info: 8-23s
      { index: 2, delay: 23500, duration: 25000 }, // Products: 23-48s
      { index: 3, delay: 48500, duration: 25000 }, // USPs: 48-73s
      { index: 4, delay: 73500, duration: 16500 }, // Visuals: 73-90s
    ];

    const timeouts: NodeJS.Timeout[] = [];

    stepTimings.forEach(({ index, delay, duration }) => {
      // Mark step as in-progress
      const startTimeout = setTimeout(() => {
        setScanSteps((prev) =>
          prev.map((step, i) => ({
            ...step,
            status: i === index ? 'in-progress' : i < index ? 'complete' : 'pending',
          }))
        );
        setCurrentStepIndex(index);
      }, delay);
      timeouts.push(startTimeout);

      // Mark step as complete
      const completeTimeout = setTimeout(() => {
        setScanSteps((prev) =>
          prev.map((step, i) => ({
            ...step,
            status: i <= index ? 'complete' : 'pending',
          }))
        );
      }, delay + duration);
      timeouts.push(completeTimeout);
    });

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setStepDetails('');
    setCurrentStepIndex(0);
    
    // Reset steps to pending
    setScanSteps((prev) =>
      prev.map((step) => ({ ...step, status: 'pending' as const }))
    );

    try {
      const response = await agentApi.startBusinessScan({
        url: mode === 'url' ? url : undefined,
        manualInput: mode === 'manual' ? manualInput : undefined,
      });

      // Update step details with actual data when scan completes
      const data = response.businessData;
      const details: string[] = [];
      
      if (data.brandName) {
        details.push(`Found ${data.brandName}`);
      }
      if (data.products && data.products.length > 0) {
        details.push(`Identified ${data.products.length} products/services`);
      }
      if (data.usps && data.usps.length > 0) {
        details.push(`Discovered ${data.usps.length} key differentiators`);
      }
      if (data.visualStyle?.imageUrls && data.visualStyle.imageUrls.length > 0) {
        details.push(`Extracted ${data.visualStyle.imageUrls.length} images`);
      }
      
      setStepDetails(details.join(' • '));
      
      // Mark all steps complete
      setScanSteps((prev) =>
        prev.map((step) => ({ ...step, status: 'complete' as const }))
      );

      setScannedData(response.businessData);
      setTaskId(response.taskId);
      
      // Small delay to show completion before transitioning
      setTimeout(() => {
        setViewMode('preview');
      }, 1000);
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

  // Show loading progress UI
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-3xl shadow-xl border border-purple-100 p-8 min-h-[600px]">
        <div className="flex h-full">
          {/* Left Sidebar */}
          <div className="w-16 flex-shrink-0 flex flex-col items-center border-r border-purple-200 pr-4 mr-8">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white mb-8">
              <User className="w-5 h-5" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Preparing tailored insights for your ads
              </h2>
              <p className="text-gray-600">This will take approximately 90 seconds</p>
            </div>

            {/* Progress Steps */}
            <div className="space-y-6">
              {scanSteps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={step.id}
                    className={`flex items-start space-x-4 transition-all duration-500 ${
                      step.status === 'pending' ? 'opacity-40' : 'opacity-100'
                    }`}
                  >
                    {/* Icon/Status */}
                    <div className="flex-shrink-0 relative">
                      {step.status === 'complete' ? (
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                      ) : step.status === 'in-progress' ? (
                        <div className="w-10 h-10 bg-white border-2 border-purple-500 rounded-full flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                          <StepIcon className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Connecting line */}
                      {index < scanSteps.length - 1 && (
                        <div
                          className={`absolute left-1/2 top-10 w-0.5 h-6 -translate-x-1/2 transition-colors duration-500 ${
                            step.status === 'complete' ? 'bg-purple-500' : 'bg-gray-300'
                          }`}
                        />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 pt-1">
                      <h3
                        className={`font-semibold mb-1 transition-colors duration-300 ${
                          step.status === 'in-progress'
                            ? 'text-purple-900'
                            : step.status === 'complete'
                            ? 'text-gray-900'
                            : 'text-gray-500'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p
                        className={`text-sm transition-colors duration-300 ${
                          step.status === 'in-progress' || step.status === 'complete'
                            ? 'text-gray-600'
                            : 'text-gray-400'
                        }`}
                      >
                        {step.description}
                      </p>
                      
                      {/* Show details for current step */}
                      {step.status === 'in-progress' && currentStepIndex === index && (
                        <div className="mt-2 text-sm text-purple-700 font-medium animate-pulse">
                          Checking out what's on your page...
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Details */}
            {stepDetails && (
              <div className="mt-8 p-4 bg-white/60 backdrop-blur rounded-xl border border-purple-200">
                <p className="text-sm text-gray-700">{stepDetails}</p>
              </div>
            )}

            {/* What we extract section */}
            <div className="mt-8 p-4 bg-white/60 backdrop-blur rounded-xl border border-purple-200">
              <p className="text-sm font-medium text-gray-700 mb-2">💡 What we extract:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Brand name and description</li>
                <li>• Products/services offerings</li>
                <li>• Unique selling points</li>
                <li>• Visual style and branding</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={handleBack}
            className="flex-1 py-4 bg-white text-coral-600 font-semibold rounded-xl border-2 border-coral-500 hover:bg-coral-50 active:scale-98 transition-all min-h-[56px] text-base"
          >
            Scan Again
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 py-4 bg-coral-500 text-white font-semibold rounded-xl hover:bg-coral-600 active:scale-98 transition-all flex items-center justify-center min-h-[56px] text-base"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Continue to Strategy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-coral-100 p-5 sm:p-8">
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-coral-50 rounded-full mb-4">
          <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-coral-600" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Tell Us About Your Business</h2>
        <p className="text-sm sm:text-base text-gray-600">
          We'll scan your website or Instagram to understand your brand automatically
        </p>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-3 sm:gap-4 mb-6">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex-1 py-4 sm:py-3 px-4 rounded-xl border-2 transition-all active:scale-95 min-h-[80px] sm:min-h-0 ${
            mode === 'url'
              ? 'border-coral-500 bg-coral-50 text-coral-900'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }`}
        >
          <Globe className="w-6 h-6 sm:w-5 sm:h-5 mx-auto mb-1" />
          <span className="text-sm font-medium">Website / Instagram URL</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`flex-1 py-4 sm:py-3 px-4 rounded-xl border-2 transition-all active:scale-95 min-h-[80px] sm:min-h-0 ${
            mode === 'manual'
              ? 'border-coral-500 bg-coral-50 text-coral-900'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }`}
        >
          <FileText className="w-6 h-6 sm:w-5 sm:h-5 mx-auto mb-1" />
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
                className="w-full pl-10 pr-4 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent min-h-[52px]"
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
              className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent resize-none"
              disabled={loading}
            />
            <p className="mt-2 text-xs text-gray-500">
              Include your business name, products/services, and target audience (min. 20 characters)
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!isValid || loading}
          className="w-full py-4 sm:py-4 bg-coral-500 text-white font-semibold rounded-xl hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 transition-all flex items-center justify-center text-base min-h-[56px]"
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
      <div className="mt-6 sm:mt-8 p-4 bg-gray-50 rounded-xl">
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
