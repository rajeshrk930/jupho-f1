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
  const baseClasses = "rounded-md p-4 transition-colors group";
  const cardClasses = gradient 
    ? "bg-base-surface border-l-4 border-signal-primary" 
    : "bg-base-surface border border-border-default";

  return (
    <div className={`${baseClasses} ${cardClasses}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-text-secondary">
          {title}
        </p>
        {Icon && (
          <div className="w-8 h-8 rounded-sm bg-base-elevated flex items-center justify-center">
            <Icon 
              size={18} 
              className="text-text-secondary" 
            />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-text-primary mb-1">{value}</p>
      {trend && (
        <div className="flex items-center gap-1 text-xs text-text-secondary mb-1">
          <TrendingUp size={12} />
          <span>{trend}</span>
        </div>
      )}
      {subtext && <p className="text-xs text-text-secondary">{subtext}</p>}
    </div>
  );
}
