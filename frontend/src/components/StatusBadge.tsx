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
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      label: 'Winning',
    },
    AVERAGE: {
      icon: Minus,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      label: 'Average',
    },
    DEAD: {
      icon: TrendingDown,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      label: 'Poor',
    },
  };

  const { icon: Icon, color, bgColor, label } = config[status];

  if (showLabel) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${color}`}>
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
