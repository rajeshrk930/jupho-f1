'use client';

import { useState } from 'react';
import { Loader2, Rocket, Upload, Check, ExternalLink, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { agentApi, api } from '@/lib/api';
import MetaAdPreview from './MetaAdPreview';
import PrimaryButton from '@/components/ui/PrimaryButton';

interface BusinessData {
  brandName: string;
  visualStyle?: {
    imageUrls?: string[];
  };
}

interface CampaignStrategy {
  objective: string;
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
}

interface Props {
  taskId: string;
  strategy: CampaignStrategy;
  businessData: BusinessData;
  onComplete: () => void;
  onBack: () => void;
}

interface LaunchError {
  type?: 'PAYMENT_REQUIRED' | 'ACCOUNT_DISABLED' | 'RATE_LIMIT' | 'AD_DISAPPROVED' | 'PERMISSION_DENIED' | 'GENERIC';
  message: string;
  action?: string;
  helpUrl?: string;
  retryable?: boolean;
}

export default function LaunchStep({ taskId, strategy, businessData, onComplete, onBack }: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(
    businessData.visualStyle?.imageUrls?.[0] || null
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<LaunchError | null>(null);
  const [adLink, setAdLink] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateSaved, setTemplateSaved] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setSelectedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLaunch = async () => {
    setLaunching(true);
    setError(null);

    try {
      const response = await agentApi.launchCampaign(
        taskId,
        uploadedFile || undefined
      );

      setSuccess(true);
      if (response.fbAdId) {
        setAdLink(`https://facebook.com/ads/manager/ad/${response.fbAdId}`);
      }

      // Wait 2 seconds before completing
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err: any) {
      const errorData = err.response?.data;
      
      // Handle structured Facebook errors
      if (errorData?.type) {
        setError({
          type: errorData.type,
          message: errorData.error,
          action: errorData.action,
          helpUrl: errorData.helpUrl,
          retryable: errorData.retryable
        });
      } else {
        // Generic error
        setError({
          message: errorData?.error || 'Failed to launch campaign. Please try again.'
        });
      }
    } finally {
      setLaunching(false);
    }
  };

  const imageUrl = previewUrl || selectedImage;

  const handleSaveAsTemplate = async () => {
    setSavingTemplate(true);
    try {
      // Prompt for template name
      const templateName = prompt('Enter a name for this template:');
      if (!templateName) {
        setSavingTemplate(false);
        return;
      }

      const category = prompt('Enter category (optional - e.g., RESTAURANT, GYM, SALON):') || undefined;

      await api.post(`/templates/from-task/${taskId}`, {
        name: templateName,
        category,
        description: `Template created from successful campaign`,
      });

      setTemplateSaved(true);
      setTimeout(() => setTemplateSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save template:', err);
      alert('Failed to save template. Please try again.');
    } finally {
      setSavingTemplate(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">🎉 Campaign Launched!</h2>
        <p className="text-gray-600 mb-6">
          Your Meta ad campaign is now live and running
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          {adLink && (
            <a
              href={adLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-coral-600 text-white rounded-lg hover:bg-coral-700 transition-colors"
            >
              View in Ads Manager
              <ExternalLink className="w-5 h-5 ml-2" />
            </a>
          )}
          <button
            onClick={handleSaveAsTemplate}
            disabled={savingTemplate || templateSaved}
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            {savingTemplate ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : templateSaved ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Saved!
              </>
            ) : (
              '💾 Save as Template'
            )}
          </button>
        </div>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left max-w-md mx-auto">
          <p className="text-sm font-medium text-gray-900 mb-2">What happens next?</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Your ad will be reviewed by Facebook (usually 24-48 hours)</li>
            <li>• Once approved, it will start showing to your target audience</li>
            <li>• You can track performance in Facebook Ads Manager</li>
            <li>• Optimize based on results after 3-5 days</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {/* Compact Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-5 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-coral-50 rounded-full mr-3">
              <Rocket className="w-5 h-5 text-coral-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Launch Campaign</h2>
              <p className="text-xs text-gray-600">Review and launch</p>
            </div>
          </div>
          {/* Compact settings badges */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">Leads</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">{strategy.budget.currency} {strategy.budget.daily}/day</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">3 variants</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left Side: Compact Image Upload - 3 columns */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Creative Image</h3>
            <div className="space-y-3">
              {imageUrl ? (
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                  <img
                    src={imageUrl}
                    alt="Ad creative"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setPreviewUrl(null);
                      setUploadedFile(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 active:scale-95 transition-all"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-2">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">No image</p>
                  </div>
                </div>
              )}

              <input
                type="file"
                id="ad-image"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="ad-image"
                className="w-full inline-block text-center py-2 px-3 border border-coral-500 text-coral-600 rounded-lg text-sm font-medium hover:bg-coral-50 cursor-pointer active:scale-98 transition-all"
              >
                {uploadedFile ? 'Change' : 'Upload'}
              </label>

              {businessData.visualStyle?.imageUrls && businessData.visualStyle.imageUrls.length > 0 && !uploadedFile && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Or select:</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {businessData.visualStyle.imageUrls.slice(0, 6).map((url, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedImage(url);
                          setPreviewUrl(null);
                        }}
                        className={`aspect-square rounded overflow-hidden border-2 transition-all ${
                          selectedImage === url
                            ? 'border-coral-500'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Option ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Collapsible Ad Copy Details */}
          <div className="bg-white rounded-xl shadow border border-gray-200">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-semibold text-gray-900">Ad Copy & Settings</span>
              {showDetails ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {showDetails && (
              <div className="p-4 pt-0 space-y-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Headline</p>
                  <p className="text-sm font-semibold text-gray-900">{strategy.adCopy.headlines[0]}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Primary Text</p>
                  <p className="text-xs text-gray-700">
                    {strategy.adCopy.primaryTexts[0]}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Description</p>
                  <p className="text-xs text-gray-600">
                    {strategy.adCopy.descriptions[0]}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">CTA</p>
                    <p className="text-xs font-medium text-gray-900">{strategy.adCopy.cta}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Platform</p>
                    <p className="text-xs font-medium text-gray-900">FB + IG</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!imageUrl && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start">
              <AlertCircle className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800">Image required to launch</p>
            </div>
          )}

          {error && (
            <div className={`rounded-xl border-2 p-6 ${
              error.type === 'PAYMENT_REQUIRED' ? 'bg-yellow-50 border-yellow-300' :
              error.type === 'ACCOUNT_DISABLED' ? 'bg-red-50 border-red-300' :
              error.type === 'RATE_LIMIT' ? 'bg-blue-50 border-blue-300' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-4">
                <AlertCircle className={`w-6 h-6 flex-shrink-0 ${
                  error.type === 'PAYMENT_REQUIRED' ? 'text-yellow-600' :
                  error.type === 'RATE_LIMIT' ? 'text-blue-600' :
                  'text-red-600'
                }`} />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-2">{error.message}</p>
                  {error.action && (
                    <p className="text-sm text-gray-700 mb-4">{error.action}</p>
                  )}
                  {error.helpUrl && (
                    <a
                      href={error.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all hover:scale-105 active:scale-95 ${
                        error.type === 'PAYMENT_REQUIRED' ? 'bg-yellow-600 hover:bg-yellow-700' :
                        error.type === 'PERMISSION_DENIED' ? 'bg-blue-600 hover:bg-blue-700' :
                        'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {error.type === 'PAYMENT_REQUIRED' ? 'Add Payment Method' :
                       error.type === 'ACCOUNT_DISABLED' ? 'Fix Account Issues' :
                       error.type === 'PERMISSION_DENIED' ? 'Reconnect Facebook' :
                       'Get Help'}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {error.retryable && (
                    <button
                      onClick={handleLaunch}
                      disabled={launching}
                      className="ml-3 inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all disabled:opacity-50"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Live Meta Ad Preview - 2 columns, always visible and sticky */}
        <div className="lg:col-span-2 lg:sticky lg:top-4 lg:self-start">
          <div className="bg-white rounded-xl shadow border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">Live Preview</h3>
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                Facebook Feed
              </div>
            </div>
            {imageUrl ? (
              <MetaAdPreview
                brandName={businessData.brandName}
                headline={strategy.adCopy.headlines[0]}
                primaryText={strategy.adCopy.primaryTexts[0]}
                description={strategy.adCopy.descriptions[0]}
                imageUrl={imageUrl}
                cta={strategy.adCopy.cta}
              />
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <p className="text-sm text-gray-500">Upload an image to see preview</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Actions Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-3 mb-2">
            <PrimaryButton
              onClick={onBack}
              variant="secondary"
              size="lg"
              disabled={launching}
              className="flex-1"
            >
              Back
            </PrimaryButton>
            <PrimaryButton
              onClick={handleLaunch}
              variant="primary"
              size="xl"
              disabled={!imageUrl || launching}
              loading={launching}
              className="flex-[2]"
              icon={!launching && <Rocket className="w-5 h-5" />}
            >
              {launching ? 'Launching... (~20s)' : 'Launch Campaign'}
            </PrimaryButton>
          </div>
          <p className="text-xs text-gray-500 text-center">
            You can pause or edit this anytime in Meta Ads Manager.
          </p>
        </div>
      </div>
    </div>
  );
}
