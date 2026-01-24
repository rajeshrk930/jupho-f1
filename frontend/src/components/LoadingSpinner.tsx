import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export default function LoadingSpinner({ size = 'md', message, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-coral-500`} />
        <div className={`${sizeClasses[size]} absolute inset-0 animate-ping opacity-20`}>
          <div className="w-full h-full rounded-full bg-coral-500"></div>
        </div>
      </div>
      {message && (
        <p className="text-sm text-charcoal-600 animate-pulse">{message}</p>
      )}
    </div>
  );
}
