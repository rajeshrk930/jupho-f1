interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'purple' | 'cyan' | 'white';
}

export function LoadingDots({ size = 'md', color = 'purple' }: LoadingDotsProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const colorClasses = {
    purple: 'bg-purple-500',
    cyan: 'bg-cyan-500',
    white: 'bg-white'
  };

  const dotClass = `${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-loadingDots`;

  return (
    <div className="flex items-center justify-center gap-2">
      <div className={dotClass} style={{ animationDelay: '0s' }} />
      <div className={dotClass} style={{ animationDelay: '0.2s' }} />
      <div className={dotClass} style={{ animationDelay: '0.4s' }} />
    </div>
  );
}
