import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  trend?: string;
  gradient?: boolean;
}

export function StatCard({ title, value, subtext, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 transition-all hover:shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500 uppercase">
          {title}
        </p>
        {Icon && (
          <Icon 
            size={20} 
            className="text-gray-400" 
          />
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      {trend && (
        <p className="text-xs text-gray-500">{trend}</p>
      )}
      {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
    </div>
  );
}
