'use client';

import { useState } from 'react';
import { Loader2, Rocket, Upload, Check, ExternalLink, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { agentApi } from '@/lib/api';
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

export default function LaunchStep({ taskId, strategy, businessData, onComplete, onBack }: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(
    businessData.visualStyle?.imageUrls?.[0] || null
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [adLink, setAdLink] = useState('');
  const [showPreview, setShowPreview] = useState(true);

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
    setError('');

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
      setError(err.response?.data?.error || 'Failed to launch campaign. Please try again.');
    } finally {
      setLaunching(false);
    }
  };

  const imageUrl = previewUrl || selectedImage;

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
        {adLink && (
          <a
            href={adLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4"
          >
            View in Ads Manager
            <ExternalLink className="w-5 h-5 ml-2" />
          </a>
        )}
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-200 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-coral-50 rounded-full mr-3">
              <Rocket className="w-6 h-6 sm:w-7 sm:h-7 text-coral-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Launch Campaign</h2>
              <p className="text-sm text-gray-600">Review and launch your Facebook ad</p>
            </div>
          </div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3 sm:px-4 sm:py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 active:scale-95 transition-all text-base sm:text-sm font-medium min-h-[48px] sm:min-h-0"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-5 h-5 sm:w-4 sm:h-4" />
                <span>Hide Preview</span>
              </>
            ) : (
              <>
                <Eye className="w-5 h-5 sm:w-4 sm:h-4" />
                <span>Show Preview</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Side: Image Selection & Details */}
        <div className="space-y-4 sm:space-y-6">{/* Campaign Preview */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow border border-gray-200 p-5 sm:p-6">
        <h3 className="font-semibold text-gray-900 mb-4 text-base sm:text-lg">Campaign Preview</h3>
        <div className="space-y-4 sm:space-y-6">
          {/* Image Upload */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Creative Image</p>
            
            {imageUrl ? (
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
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
                  className="absolute top-2 right-2 p-3 sm:p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 active:scale-95 transition-all min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-3">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No image selected</p>
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
              className="w-full inline-block text-center py-4 sm:py-3 px-4 border border-coral-500 text-coral-600 rounded-xl font-medium hover:bg-coral-50 cursor-pointer active:scale-98 transition-all text-base min-h-[48px]"
            >
              {uploadedFile ? 'Change Image' : 'Upload Image'}
            </label>

            {businessData.visualStyle?.imageUrls && businessData.visualStyle.imageUrls.length > 0 && !uploadedFile && (
              <div className="mt-4">
                <p className="text-xs text-gray-600 mb-2">Or select from scraped images:</p>
                <div className="grid grid-cols-3 gap-2">
                  {businessData.visualStyle.imageUrls.slice(0, 6).map((url, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedImage(url);
                        setPreviewUrl(null);
                      }}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
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

          {/* Ad Copy */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Ad Copy</p>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Headline</p>
                <p className="font-semibold text-gray-900">{strategy.adCopy.headlines[0]}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Primary Text</p>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {strategy.adCopy.primaryTexts[0]}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-600">
                  {strategy.adCopy.descriptions[0]}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Call to Action</p>
                <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-lg">
                  {strategy.adCopy.cta}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Settings Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-coral-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Campaign Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Objective</p>
            <p className="font-medium text-gray-900">{strategy.objective}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Daily Budget</p>
            <p className="font-medium text-gray-900">{strategy.budget.currency} {strategy.budget.daily}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Ad Variants</p>
            <p className="font-medium text-gray-900">3 copies each</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Platform</p>
            <p className="font-medium text-gray-900">Facebook + Instagram</p>
          </div>
        </div>
      </div>

      {/* Warning */}
      {!imageUrl && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-900 mb-1">Image Required</p>
            <p className="text-sm text-yellow-700">
              Please upload an image or select one from the scraped images to continue.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}</div>

        {/* Right Side: Live Meta Ad Preview */}
        {showPreview && imageUrl && (
          <div className="lg:sticky lg:top-6">
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Live Ad Preview</h3>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Facebook Feed
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                This is how your ad will appear in users' Facebook feeds
              </p>
              <MetaAdPreview
                brandName={businessData.brandName}
                headline={strategy.adCopy.headlines[0]}
                primaryText={strategy.adCopy.primaryTexts[0]}
                description={strategy.adCopy.descriptions[0]}
                imageUrl={imageUrl}
                cta={strategy.adCopy.cta}
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
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
          className="flex-1"
          icon={!launching && <Rocket className="w-5 h-5" />}
        >
          {launching ? 'Launching... (~20s)' : 'Launch Campaign'}
        </PrimaryButton>
      </div>

      {/* Disclaimer */}
      <div className="text-xs text-gray-500 text-center">
        By launching, you agree that this ad will be created in your connected Facebook Ad Account.
        You can pause or edit it anytime in Ads Manager.
      </div>
    </div>
  );
}
