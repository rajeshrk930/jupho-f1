import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatusBadgeProps {
  status: 'WINNING' | 'AVERAGE' | 'DEAD';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function StatusBadge({ status, size = 'md', showLabel = false }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const iconSize = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  const config = {
    WINNING: {
      icon: TrendingUp,
      color: 'text-text-primary',
      bgColor: 'bg-base-elevated',
      label: 'Winning',
    },
    AVERAGE: {
      icon: Minus,
      color: 'text-text-secondary',
      bgColor: 'bg-base-surface',
      label: 'Average',
    },
    DEAD: {
      icon: TrendingDown,
      color: 'text-signal-danger',
      bgColor: 'bg-signal-danger/10',
      label: 'Poor',
    },
  };

  const { icon: Icon, color, bgColor, label } = config[status];

  if (showLabel) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm ${bgColor} ${color} text-sm font-medium`}>
        <Icon size={iconSize[size]} />
        {label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center justify-center ${sizeClasses[size]}`}>
      <Icon size={iconSize[size]} className={color} />
    </span>
  );
}
