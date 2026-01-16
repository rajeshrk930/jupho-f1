'use client';

import { useState } from 'react';
import { Loader2, Sparkles, AlertCircle, MapPin, Globe, Lightbulb } from 'lucide-react';
import { agentApi } from '@/lib/api';

interface BusinessData {
  brandName: string;
  description: string;
  industry?: string;
  products?: string[];
  usps?: string[];
  targetAudience?: {
    ageMin: number;
    ageMax: number;
    gender: string;
    interests: string[];
    description: string;
  };
  location?: {
    type: string;
    name: string;
    detected: boolean;
  };
  businessType?: 'LOCAL' | 'GLOBAL';
  confidence?: number;
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
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationRequired, setLocationRequired] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  const examples = [
    {
      title: "🏋️ Gym/Fitness",
      text: "I run Urban Fitness Studio in Hyderabad. We provide personal training and group fitness classes for busy professionals. Get 50% off on 6am morning batch this month."
    },
    {
      title: "🍕 Restaurant",
      text: "Mama's Pizza in Bangalore. We serve authentic wood-fired pizzas with free home delivery. Order now and get 2+1 offer on large pizzas."
    },
    {
      title: "📚 Online Course",
      text: "NEET preparation online course with 500+ video lectures and doubt clearing sessions. Pan-India students can enroll. Limited seats for 2026 batch."
    },
    {
      title: "💄 Beauty Salon",
      text: "Glamour Beauty Salon in Mumbai. We offer bridal makeup, haircuts, and spa services. Book now for 30% off on bridal packages."
    },
    {
      title: "🛍️ E-commerce",
      text: "Handmade jewelry online store. We ship all across India. Each piece is unique and made with natural stones. Free shipping on orders above ₹999."
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLocationRequired(false);
    setLoading(true);

    try {
      const response = await agentApi.startBusinessScan({
        description: description.trim(),
        location: location.trim() || undefined,
        website: website.trim() || undefined,
      });

      if (response.success) {
        onComplete(response.businessData, response.taskId);
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      
      if (errorData?.requiresLocation) {
        setLocationRequired(true);
        setError(errorData.error || 'Location is required for your business type');
        // Auto-focus location field
        setTimeout(() => {
          document.getElementById('location-field')?.focus();
        }, 100);
      } else {
        setError(errorData?.error || 'Failed to analyze business. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isValid = description.trim().length >= 20;
  const charCount = description.length;
  const charMin = 20;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-gradient-to-br from-coral-50 via-mint-50 to-white rounded-3xl shadow-xl border border-coral-100 p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-coral-500 to-coral-600 rounded-2xl shadow-lg mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Tell Us About Your Business 🚀
          </h2>
          <p className="text-gray-600">
            Just describe what you sell. AI will handle the rest.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Field 1: Description (Mandatory) */}
          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              1️⃣ What do you sell? <span className="text-coral-600">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., I run Rajesh Gym in Hyderabad. I want to get more students for my 6am batch with a 50% discount offer."
              className={`w-full p-4 border-2 rounded-xl h-32 focus:outline-none focus:ring-2 transition-all resize-none ${
                charCount < charMin 
                  ? 'border-gray-300 focus:border-coral-500 focus:ring-coral-200' 
                  : 'border-green-300 focus:border-green-500 focus:ring-green-200'
              }`}
              disabled={loading}
            />
            <div className="flex items-center justify-between mt-2">
              <button
                type="button"
                onClick={() => setShowExamples(!showExamples)}
                className="text-sm text-coral-600 hover:text-coral-700 font-medium flex items-center gap-1"
              >
                <Lightbulb className="w-4 h-4" />
                {showExamples ? 'Hide Examples' : 'See Examples'}
              </button>
              <span className={`text-sm font-medium ${
                charCount >= charMin ? 'text-green-600' : 'text-gray-500'
              }`}>
                {charCount >= charMin ? `✓ ${charCount} characters` : `${charCount}/${charMin} characters minimum`}
              </span>
            </div>

            {/* Examples Dropdown */}
            {showExamples && (
              <div className="mt-4 p-4 bg-white rounded-xl border border-coral-200 space-y-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Click any example to use it:
                </p>
                {examples.map((example, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setDescription(example.text);
                      setShowExamples(false);
                    }}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-coral-50 rounded-lg border border-gray-200 hover:border-coral-300 transition-all"
                  >
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      {example.title}
                    </p>
                    <p className="text-xs text-gray-600">
                      {example.text}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Field 2: Location (Optional with smart validation) */}
          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              2️⃣ Where are most of your customers? 
              <span className="text-gray-500 font-normal ml-2">(Optional)</span>
            </label>
            <div className="relative">
              <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                locationRequired ? 'text-red-500' : 'text-gray-400'
              }`} />
              <input
                id="location-field"
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (locationRequired && e.target.value.trim()) {
                    setLocationRequired(false);
                    setError('');
                  }
                }}
                placeholder="e.g., Hyderabad"
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  locationRequired
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-coral-500 focus:ring-coral-200'
                }`}
                disabled={loading}
              />
            </div>
            {locationRequired && error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            {!locationRequired && (
              <p className="mt-2 text-sm text-gray-600 flex items-center gap-1">
                <span>💡</span>
                Leave blank if you serve all of India
              </p>
            )}
          </div>

          {/* Field 3: Website/Instagram (Optional) */}
          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              3️⃣ Website or Instagram Link 
              <span className="text-gray-500 font-normal ml-2">(Optional)</span>
            </label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-coral-500 focus:ring-2 focus:ring-coral-200 transition-all"
                disabled={loading}
              />
            </div>
            <p className="mt-2 text-sm text-gray-600 flex items-center gap-1">
              <span>💡</span>
              For scraping images & branding (not required)
            </p>
          </div>

          {/* General Error (not location-specific) */}
          {error && !locationRequired && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isValid || loading}
            className="w-full py-5 bg-gradient-to-r from-coral-500 to-coral-600 text-white font-bold rounded-2xl hover:from-coral-600 hover:to-coral-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center justify-center text-lg shadow-xl shadow-coral-300/50 hover:shadow-2xl hover:shadow-coral-400/50 transform hover:scale-105"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin mr-3" />
                <span>AI is analyzing your business...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 mr-3" />
                <span>✨ Generate AI Strategy</span>
              </>
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-6 p-5 bg-white/70 backdrop-blur-sm rounded-2xl border-2 border-white shadow-lg">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🎯</div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                What happens next?
              </p>
              <p className="text-sm text-gray-700">
                AI will analyze your business, identify your target audience, and create a complete Meta ad campaign with headlines, ad copy, and targeting—all in about 15 seconds.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/50 rounded-xl">
            <div className="text-2xl mb-1">⚡</div>
            <p className="text-xs font-semibold text-gray-900">30 Seconds</p>
            <p className="text-xs text-gray-600">Average setup time</p>
          </div>
          <div className="text-center p-4 bg-white/50 rounded-xl">
            <div className="text-2xl mb-1">🎯</div>
            <p className="text-xs font-semibold text-gray-900">Zero Knowledge</p>
            <p className="text-xs text-gray-600">Required to start</p>
          </div>
          <div className="text-center p-4 bg-white/50 rounded-xl">
            <div className="text-2xl mb-1">🚀</div>
            <p className="text-xs font-semibold text-gray-900">Ready to Launch</p>
            <p className="text-xs text-gray-600">Campaign in minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
