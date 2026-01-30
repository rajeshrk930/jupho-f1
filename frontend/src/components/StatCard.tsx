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
    <div 
      className="bg-white border border-gray-200 rounded-lg p-6 transition-all duration-300 hover:-translate-y-1 group"
      style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 20px 60px -15px rgba(139, 92, 246, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </p>
        {Icon && (
          <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
            <Icon 
              size={18} 
              className="text-purple-500" 
            />
          </div>
        )}
      </div>
      <p 
        className="text-4xl font-bold text-gray-900 mb-2 tracking-tight"
        style={{ 
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum"'
        }}
      >
        {value}
      </p>
      {trend && (
        <p className="text-sm text-purple-600 font-medium">{trend}</p>
      )}
      {subtext && <p className="text-sm text-gray-600">{subtext}</p>}
    </div>
  );
}
