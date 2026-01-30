import { Sparkles } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction
}: EmptyStateProps) {
  const defaultIcon = (
    <div className="relative">
      <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-2xl" />
      <Sparkles className="relative w-16 h-16 text-purple-500 animate-bounceSpring" />
    </div>
  );

  return (
    <div className="text-center py-16 px-6">
      <div className="mb-6 flex justify-center">
        {icon || defaultIcon}
      </div>
      <h3 className="text-2xl font-bold text-charcoal-900 mb-3 tracking-tight">
        {title}
      </h3>
      <p className="text-base text-charcoal-600 mb-8 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      {(actionLabel && (actionHref || onAction)) && (
        actionHref ? (
          <Link 
            href={actionHref}
            className="btn-primary"
          >
            <Sparkles className="w-5 h-5" />
            {actionLabel}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="btn-primary"
          >
            <Sparkles className="w-5 h-5" />
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}
