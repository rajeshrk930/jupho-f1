'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';

interface BudgetSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  currency?: string;
  label?: string;
  showEstimates?: boolean;
}

export default function BudgetSlider({
  value,
  onChange,
  min = 500,
  max = 5000,
  currency = '₹',
  label = 'Daily Budget',
  showEstimates = true,
}: BudgetSliderProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const percentage = ((value - min) / (max - min)) * 100;

  // Calculate position labels
  const getLabel = (val: number) => {
    if (val <= min + (max - min) * 0.25) return 'Limited';
    if (val <= min + (max - min) * 0.5) return 'Basic Reach';
    if (val <= min + (max - min) * 0.75) return 'Good Reach';
    return '2x+ Results';
  };

  const estimatedReach = Math.floor((value / min) * 50000);
  const estimatedLeads = Math.floor((value / 100) * 3);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-gray-900">{label}</h3>
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
        <div className="text-2xl font-bold text-coral-600">
          {currency}
          {value.toLocaleString()}
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg">
          Your budget works - more budget, better results!
        </div>
      )}

      {/* Slider */}
      <div className="relative pt-2 pb-6">
        {/* Track */}
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          {/* Progress */}
          <div
            className="absolute h-full bg-coral-500 rounded-full transition-all duration-200"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute top-0 left-0 w-full h-3 opacity-0 cursor-pointer"
        />

        {/* Custom Thumb */}
        <div
          className="absolute top-0 w-6 h-6 bg-white border-4 border-coral-500 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1.5 transition-all duration-200 hover:scale-110"
          style={{ left: `${percentage}%` }}
        />

        {/* Labels */}
        <div className="flex justify-between text-xs text-gray-600 mt-3 px-1">
          <span>Limited</span>
          <span>Basic Reach</span>
          <span className="font-semibold text-coral-600">{getLabel(value)}</span>
          <span>2x+ Results</span>
        </div>
      </div>

      {/* Estimates */}
      {showEstimates && (
        <div className="bg-coral-50 rounded-xl p-4 border border-coral-100">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Estimated Reach</p>
              <p className="text-xl font-bold text-gray-900">
                {estimatedReach.toLocaleString()}+
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Est. Daily Leads</p>
              <p className="text-xl font-bold text-gray-900">{estimatedLeads}-{estimatedLeads * 2}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Estimates vary based on targeting and creative quality
          </p>
        </div>
      )}
    </div>
  );
}
