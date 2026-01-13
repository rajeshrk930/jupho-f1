'use client';

import { useState, useEffect } from 'react';
import { Loader2, Globe, FileText, Sparkles, CheckCircle, Package, Zap, Mail, Phone, Image, Link as LinkIcon, User } from 'lucide-react';
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

  // Show loading progress UI with website preview
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-coral-50 via-mint-50 to-white rounded-3xl shadow-xl border border-coral-100 p-8 min-h-[600px]">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Scanning Your Website
            </h2>
            <p className="text-gray-600">This will take approximately 90 seconds</p>
          </div>

          {/* Main Content - Website Preview + Steps */}
          <div className="flex gap-6 flex-1">
            {/* Website Preview with Virtual Scanning */}
            <div className="w-1/2 bg-white rounded-2xl border-2 border-coral-200 overflow-hidden relative group shadow-lg">
              {/* Website iframe */}
              <div className="w-full h-full relative">
                <iframe
                  src={url}
                  className="w-full h-full border-0"
                  title="Website Preview"
                  sandbox="allow-same-origin allow-scripts"
                  style={{ pointerEvents: 'none' }}
                />
                
                {/* Scanning Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-coral-500/10 to-transparent pointer-events-none">
                  {/* Horizontal scanning line */}
                  <div 
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-coral-500 to-transparent animate-scan-line"
                    style={{
                      boxShadow: '0 0 20px rgba(255, 127, 80, 0.8)'
                    }}
                  />
                  
                  {/* Grid overlay */}
                  <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                  
                  {/* Corner brackets */}
                  <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-coral-500" />
                  <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-coral-500" />
                  <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-coral-500" />
                  <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-coral-500" />
                </div>

                {/* Current Step Highlight */}
                {currentStepIndex >= 0 && (
                  <div className="absolute top-4 left-4 right-4 bg-coral-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-semibold">
                        {scanSteps[currentStepIndex]?.title}
                      </span>
                    </div>
                    <p className="text-xs mt-1 opacity-90">
                      {scanSteps[currentStepIndex]?.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Steps */}
            <div className="w-1/2 flex flex-col">
              <div className="space-y-4 flex-1">
                {scanSteps.map((step, index) => {
                  const StepIcon = step.icon;
                  return (
                    <div
                      key={step.id}
                      className={`flex items-start space-x-3 transition-all duration-500 ${
                        step.status === 'pending' ? 'opacity-40' : 'opacity-100'
                      }`}
                    >
                      {/* Icon/Status */}
                      <div className="flex-shrink-0 relative">
                        {step.status === 'complete' ? (
                          <div className="w-9 h-9 bg-gradient-to-br from-coral-500 to-coral-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                        ) : step.status === 'in-progress' ? (
                          <div className="w-9 h-9 bg-white border-2 border-coral-500 rounded-full flex items-center justify-center">
                            <Loader2 className="w-4 h-4 text-coral-600 animate-spin" />
                          </div>
                        ) : (
                          <div className="w-9 h-9 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                            <StepIcon className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Connecting line */}
                        {index < scanSteps.length - 1 && (
                          <div
                            className={`absolute left-1/2 top-9 w-0.5 h-5 -translate-x-1/2 transition-colors duration-500 ${
                              step.status === 'complete' ? 'bg-coral-500' : 'bg-gray-300'
                            }`}
                          />
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 pt-0.5">
                        <h3
                          className={`font-semibold text-sm mb-0.5 transition-colors duration-300 ${
                            step.status === 'in-progress'
                              ? 'text-coral-900'
                              : step.status === 'complete'
                              ? 'text-gray-900'
                              : 'text-gray-500'
                          }`}
                        >
                          {step.title}
                        </h3>
                        <p
                          className={`text-xs transition-colors duration-300 ${
                            step.status === 'in-progress' || step.status === 'complete'
                              ? 'text-gray-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {step.description}
                        </p>
                        
                        {/* Show details for current step */}
                        {step.status === 'in-progress' && currentStepIndex === index && (
                          <div className="mt-1.5 text-xs text-coral-700 font-medium animate-pulse">
                            Analyzing your content...
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* What we extract section */}
              <div className="mt-4 p-4 bg-white/60 backdrop-blur rounded-xl border border-coral-200">
                <p className="text-sm font-medium text-gray-700 mb-2">💡 What we extract:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Brand name and description</li>
                  <li>• Products/services offerings</li>
                  <li>• Unique selling points (no duplicates)</li>
                  <li>• Visual style and branding</li>
                </ul>
              </div>
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
            <div className="p-4 bg-coral-50 border border-coral-200 rounded-lg">
              <div className="flex items-start">
                <FileText className="w-5 h-5 text-coral-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-coral-900 mb-1">Business Description</h3>
                  <p className="text-sm text-gray-700">{scannedData.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Products */}
          {scannedData.products && scannedData.products.length > 0 && (
            <div className="p-4 bg-mint-50 border border-mint-200 rounded-lg">
              <div className="flex items-start">
                <Package className="w-5 h-5 text-mint-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-mint-900 mb-2">
                    Products/Services <span className="text-xs font-normal text-mint-600">({scannedData.products.length} found)</span>
                  </h3>
                  <ul className="space-y-1">
                    {scannedData.products.map((product, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start">
                        <span className="text-mint-600 mr-2">•</span>
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
            <div className="p-4 bg-coral-50 border border-coral-200 rounded-lg">
              <div className="flex items-start mb-3">
                <Image className="w-5 h-5 text-coral-600 mt-0.5 mr-3 flex-shrink-0" />
                <h3 className="text-sm font-semibold text-coral-900">
                  Extracted Images <span className="text-xs font-normal text-coral-600">({scannedData.visualStyle.imageUrls.length} found)</span>
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
    <div className="relative overflow-hidden bg-gradient-to-br from-coral-50 via-mint-50 to-white rounded-3xl shadow-2xl border-0 p-8">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-coral-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-mint-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-coral-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      
      <div className="relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-coral-500 to-coral-600 rounded-2xl mb-4 shadow-lg transform hover:scale-110 transition-transform">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-coral-500 to-coral-600 mb-3">
            What's Your Website? ✨
          </h2>
          <p className="text-lg text-gray-700 max-w-xl mx-auto">
            Drop your URL and watch the magic happen! We'll analyze everything in 90 seconds 🚀
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-coral-200">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-coral-400 to-coral-500 border-2 border-white" />
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-mint-400 to-mint-500 border-2 border-white" />
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-coral-300 to-mint-400 border-2 border-white" />
            </div>
            <span className="text-xs font-semibold text-gray-700">2,847 businesses analyzed this week</span>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex-1 py-5 px-6 rounded-2xl transition-all active:scale-95 transform hover:scale-105 ${
              mode === 'url'
                ? 'bg-gradient-to-br from-coral-500 to-coral-600 text-white shadow-xl shadow-coral-300/50'
                : 'bg-white/70 backdrop-blur-sm text-gray-700 border-2 border-white shadow-md hover:shadow-lg'
            }`}
          >
            <Globe className="w-7 h-7 mx-auto mb-2" />
            <span className="text-base font-bold">🌐 Scan Website</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`flex-1 py-5 px-6 rounded-2xl transition-all active:scale-95 transform hover:scale-105 ${
              mode === 'manual'
                ? 'bg-gradient-to-br from-coral-500 to-coral-600 text-white shadow-xl shadow-coral-300/50'
                : 'bg-white/70 backdrop-blur-sm text-gray-700 border-2 border-white shadow-md hover:shadow-lg'
            }`}
          >
            <FileText className="w-7 h-7 mx-auto mb-2" />
            <span className="text-base font-bold">✍️ Describe It</span>
          </button>
        </div>

      <form onSubmit={handleSubmit}>
        {mode === 'url' ? (
          <div className="mb-6">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border-2 border-white">
              <label className="block text-base font-bold text-gray-800 mb-3">
                🔗 Paste Your Website URL
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-coral-400" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourawesome.business"
                  className="w-full pl-14 pr-4 py-5 text-lg font-medium border-2 border-coral-200 rounded-xl focus:ring-4 focus:ring-coral-300 focus:border-coral-400 bg-white shadow-inner"
                  disabled={loading}
                />
              </div>
              <div className="mt-4 flex items-start gap-2 p-3 bg-gradient-to-r from-coral-50 to-mint-50 rounded-lg border border-coral-100">
                <Sparkles className="w-5 h-5 text-coral-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">AI will extract:</span> Brand identity, products, unique selling points, visual style & contact info
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border-2 border-white">
              <label className="block text-base font-bold text-gray-800 mb-3">
                ✨ Tell Us Your Story
              </label>
              <div className="mb-4 p-4 bg-gradient-to-br from-mint-50 to-mint-100 border-2 border-mint-200 rounded-xl">
                <p className="text-sm font-bold text-mint-900 mb-2 flex items-center gap-2">
                  <span className="text-lg">💡</span> What should you include?
                </p>
                <ul className="text-sm text-mint-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-lg">🎯</span>
                    <span>What products or services you sell</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">👥</span>
                    <span>Who your dream customers are</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">⭐</span>
                    <span>What makes you special & different</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">🚀</span>
                    <span>Your main business goal right now</span>
                  </li>
                </ul>
              </div>
              <textarea
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Example: I run a boutique coffee roastery in Portland. We source organic beans from Ethiopia and Colombia, roast them in small batches, and sell to local cafes and online. Our customers are coffee enthusiasts who care about sustainability and taste. We're known for our unique honey-processed beans and eco-friendly packaging. Goal: Get 50 new wholesale clients this quarter!"
                rows={8}
                className="w-full px-5 py-4 text-base border-2 border-coral-200 rounded-xl focus:ring-4 focus:ring-coral-300 focus:border-coral-400 resize-none bg-white shadow-inner font-medium"
                disabled={loading}
              />
              <p className="mt-3 text-sm text-gray-600 font-medium">
                <span className="text-coral-600">Pro tip:</span> The more details you share, the better your AI-powered ads will be! 🎨
              </p>
            </div>
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
          className="w-full py-6 bg-gradient-to-r from-coral-500 to-coral-600 text-white font-bold rounded-2xl hover:from-coral-600 hover:to-coral-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center justify-center text-lg shadow-xl shadow-coral-300/50 hover:shadow-2xl hover:shadow-coral-400/50 transform hover:scale-105"
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin mr-3" />
              <span>Analyzing Your Business... 🔍</span>
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6 mr-3" />
              <span>{mode === 'url' ? '🚀 Scan My Website' : '✨ Generate My Ads'}</span>
            </>
          )}
        </button>
      </form>

      {/* Example Section */}
      <div className="mt-8 p-5 bg-white/70 backdrop-blur-sm rounded-2xl border-2 border-white shadow-lg">
        <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-lg">💡</span> What we extract:
        </p>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-coral-500 to-coral-600"></span>
            Brand name and description
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-coral-500 to-coral-600"></span>
            Products/services offered
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-coral-500 to-coral-600"></span>
            Unique selling points (USPs)
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-coral-500 to-coral-600"></span>
            Visual style and branding
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-coral-500 to-coral-600"></span>
            Contact information
          </li>
        </ul>
      </div>
      </div>
    </div>
  );
}
