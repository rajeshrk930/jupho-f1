import { LucideIcon, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  trend?: string;
  gradient?: boolean;
}

export function StatCard({ title, value, subtext, icon: Icon, trend, gradient = true }: StatCardProps) {
  const baseClasses = "rounded-lg p-4 shadow-sm transition-colors group";
  const gradientClasses = gradient 
    ? "bg-white border border-gray-200 hover:border-teal-600" 
    : "bg-white border border-gray-200 hover:border-gray-300";

  return (
    <div className={`${baseClasses} ${gradientClasses}`}>
      <div className="flex items-center justify-between mb-2">
        <p className={`text-xs font-medium ${gradient ? 'text-gray-600' : 'text-gray-600'}`}>
          {title}
        </p>
        {Icon && (
          <Icon 
            size={18} 
            className={`${gradient ? 'text-teal-600' : 'text-gray-500'}`} 
          />
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      {trend && (
        <div className="flex items-center gap-1 text-xs text-green-600 mb-1">
          <TrendingUp size={12} />
          <span>{trend}</span>
        </div>
      )}
      {subtext && <p className="text-xs text-gray-600">{subtext}</p>}
    </div>
  );
}
