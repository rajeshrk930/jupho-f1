interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'coral' | 'mint' | 'white';
}

export function LoadingDots({ size = 'md', color = 'coral' }: LoadingDotsProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const colorClasses = {
    coral: 'bg-coral-500',
    mint: 'bg-mint-500',
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
