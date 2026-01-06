import { CheckCircle2, AlertCircle, Lightbulb } from 'lucide-react';

interface EnhancedListItemProps {
  children: React.ReactNode;
  type?: 'success' | 'warning' | 'info';
}

export function EnhancedListItem({ children, type = 'success' }: EnhancedListItemProps) {
  const icons = {
    success: <CheckCircle2 size={16} className="text-green-500" />,
    warning: <AlertCircle size={16} className="text-orange-500" />,
    info: <Lightbulb size={16} className="text-teal-500" />,
  };

  return (
    <li className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group">
      <span className="flex-shrink-0 mt-0.5">{icons[type]}</span>
      <span className="flex-1 text-gray-800 text-sm leading-relaxed">{children}</span>
    </li>
  );
}

interface EnhancedListProps {
  children: React.ReactNode;
  className?: string;
}

export function EnhancedList({ children, className = '' }: EnhancedListProps) {
  return <ul className={`space-y-2 ${className}`}>{children}</ul>;
}
