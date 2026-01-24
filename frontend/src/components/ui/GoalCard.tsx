'use client';

import { Check } from 'lucide-react';
import { ReactNode } from 'react';

interface GoalCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  isSelected: boolean;
  isRecommended?: boolean;
  badge?: string;
  features: string[];
  onClick: () => void;
}

export default function GoalCard({
  icon,
  title,
  description,
  isSelected,
  isRecommended = false,
  badge,
  features,
  onClick,
}: GoalCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-200 group ${
        isSelected
          ? 'border-coral-500 bg-coral-50 shadow-lg scale-[1.02]'
          : 'border-gray-200 bg-white hover:border-coral-200 hover:shadow-md hover:scale-[1.01]'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
            isSelected
              ? 'bg-coral-500 text-white shadow-sm'
              : 'bg-gray-100 text-gray-500 group-hover:bg-coral-50 group-hover:text-coral-500'
          }`}
        >
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title & Badge */}
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            {isRecommended && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" />
                Recommended
              </span>
            )}
            {badge && !isRecommended && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                {badge}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">{description}</p>

          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {features.map((feature, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-white text-gray-700 border border-coral-200'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 group-hover:bg-white'
                }`}
              >
                {feature.startsWith('✓') || feature.startsWith('✅') ? (
                  <>
                    <Check className="w-3 h-3 mr-1.5 text-green-600" />
                    {feature.replace(/^[✓✅]\s*/, '')}
                  </>
                ) : (
                  feature
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Selection Checkmark */}
        {isSelected && (
          <div className="flex-shrink-0">
            <div className="w-6 h-6 rounded-full bg-coral-500 flex items-center justify-center">
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
