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
  const defaultIcon = <Sparkles className="w-16 h-16 text-coral-300" />;

  return (
    <div className="text-center py-12 px-6">
      <div className="mb-4 flex justify-center">
        {icon || defaultIcon}
      </div>
      <h3 className="text-xl font-semibold text-charcoal-900 mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-charcoal-600 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {(actionLabel && (actionHref || onAction)) && (
        actionHref ? (
          <Link 
            href={actionHref}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-coral-500 to-coral-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4" />
            {actionLabel}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-coral-500 to-coral-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4" />
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}
