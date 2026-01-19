'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import MetaAdPreview from '../agent/MetaAdPreview';

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  objective: string;
  targeting: {
    ageMin: number;
    ageMax: number;
    interestKeywords: string[];
    location?: {
      isLocal: boolean;
      cityName?: string;
      radius?: number;
    };
  };
  budget: {
    dailyAmount: number;
    currency: string;
  };
  adCopy: {
    headlines: string[];
    primaryTexts: string[];
    descriptions: string[];
    cta: string;
  };
}

interface TemplateEditorProps {
  template: Template;
  onClose: () => void;
  onSuccess: () => void;
}

export function TemplateEditor({ template, onClose, onSuccess }: TemplateEditorProps) {
  const [headlines, setHeadlines] = useState<string[]>(template.adCopy.headlines);
  const [primaryTexts, setPrimaryTexts] = useState<string[]>(template.adCopy.primaryTexts);
  const [descriptions, setDescriptions] = useState<string[]>(template.adCopy.descriptions);
  const [cta, setCta] = useState(template.adCopy.cta);
  const [budget, setBudget] = useState(template.budget.dailyAmount);
  const [ageMin, setAgeMin] = useState(template.targeting.ageMin);
  const [ageMax, setAgeMax] = useState(template.targeting.ageMax);
  const [cityName, setCityName] = useState(template.targeting.location?.cityName || '');
  const [radius, setRadius] = useState(template.targeting.location?.radius || 5);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateFields = () => {
    // Validate headlines (40 chars max)
    for (const headline of headlines) {
      if (headline.length > 40) {
        setError(`Headline too long: "${headline}" (${headline.length}/40 chars)`);
        return false;
      }
    }

    // Validate primary texts (125 chars max)
    for (const text of primaryTexts) {
      if (text.length > 125) {
        setError(`Primary text too long (${text.length}/125 chars)`);
        return false;
      }
    }

    // Validate descriptions (30 chars max)
    for (const desc of descriptions) {
      if (desc.length > 30) {
        setError(`Description too long: "${desc}" (${desc.length}/30 chars)`);
        return false;
      }
    }

    if (!imageFile && !imagePreview) {
      setError('Please upload an image for your ad');
      return false;
    }

    return true;
  };

  const handleLaunch = async () => {
    setError('');

    if (!validateFields()) {
      return;
    }

    try {
      setLaunching(true);

      const formData = new FormData();
      formData.append('headlines', JSON.stringify(headlines));
      formData.append('primaryTexts', JSON.stringify(primaryTexts));
      formData.append('descriptions', JSON.stringify(descriptions));
      formData.append('cta', cta);
      formData.append(
        'budget',
        JSON.stringify({
          dailyAmount: budget,
          currency: template.budget.currency,
        })
      );
      formData.append(
        'targeting',
        JSON.stringify({
          ageMin,
          ageMax,
          interestKeywords: template.targeting.interestKeywords,
          location: {
            isLocal: template.targeting.location?.isLocal || true,
            cityName,
            radius,
          },
        })
      );

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await api.post(`/templates/${template.id}/launch`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.message) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Launch error:', err);
      setError(err.response?.data?.error || 'Failed to launch campaign. Please try again.');
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Edit Form */}
            <div className="space-y-6">
              {/* Headlines */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Headlines (40 chars max)
                </label>
                {headlines.map((headline, idx) => (
                  <div key={idx} className="mb-2">
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => {
                        const newHeadlines = [...headlines];
                        newHeadlines[idx] = e.target.value;
                        setHeadlines(newHeadlines);
                      }}
                      maxLength={40}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {headline.length}/40 characters
                    </p>
                  </div>
                ))}
              </div>

              {/* Primary Texts */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Text (125 chars max)
                </label>
                {primaryTexts.map((text, idx) => (
                  <div key={idx} className="mb-2">
                    <textarea
                      value={text}
                      onChange={(e) => {
                        const newTexts = [...primaryTexts];
                        newTexts[idx] = e.target.value;
                        setPrimaryTexts(newTexts);
                      }}
                      maxLength={125}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {text.length}/125 characters
                    </p>
                  </div>
                ))}
              </div>

              {/* Descriptions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descriptions (30 chars max)
                </label>
                {descriptions.map((desc, idx) => (
                  <div key={idx} className="mb-2">
                    <input
                      type="text"
                      value={desc}
                      onChange={(e) => {
                        const newDescs = [...descriptions];
                        newDescs[idx] = e.target.value;
                        setDescriptions(newDescs);
                      }}
                      maxLength={30}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {desc.length}/30 characters
                    </p>
                  </div>
                ))}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-48 rounded-lg mb-2"
                      />
                    ) : (
                      <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    )}
                    <span className="text-sm text-blue-600 font-medium">
                      {imagePreview ? 'Change Image' : 'Upload Image'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PNG, JPG up to 5MB
                    </span>
                  </label>
                </div>
              </div>

              {/* Targeting */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Targeting
                </label>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-gray-600">Age Min</label>
                      <input
                        type="number"
                        value={ageMin}
                        onChange={(e) => setAgeMin(parseInt(e.target.value))}
                        min={18}
                        max={65}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-600">Age Max</label>
                      <input
                        type="number"
                        value={ageMax}
                        onChange={(e) => setAgeMax(parseInt(e.target.value))}
                        min={18}
                        max={65}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">City (Optional)</label>
                    <input
                      type="text"
                      value={cityName}
                      onChange={(e) => setCityName(e.target.value)}
                      placeholder="e.g., Mumbai"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Radius (km)</label>
                    <input
                      type="number"
                      value={radius}
                      onChange={(e) => setRadius(parseInt(e.target.value))}
                      min={1}
                      max={50}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Budget ({template.budget.currency})
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(parseInt(e.target.value))}
                  min={100}
                  step={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Right: Preview */}
            <div className="lg:sticky lg:top-6 h-fit">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ad Preview</h3>
              <MetaAdPreview
                brandName="Your Business"
                headline={headlines[0] || 'Your Headline'}
                primaryText={primaryTexts[0] || 'Your primary text'}
                description={descriptions[0] || 'Description'}
                imageUrl={imagePreview || '/placeholder-ad.jpg'}
                cta={cta}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={launching}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleLaunch}
              disabled={launching}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {launching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Launching Campaign...
                </>
              ) : (
                'Launch Campaign'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
