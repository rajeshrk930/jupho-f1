'use client';

import { CheckCircle2, XCircle, Clock, Pause, FileEdit } from 'lucide-react';

interface CampaignStatusBadgeProps {
  status: string;
  className?: string;
}

export default function CampaignStatusBadge({ status, className = '' }: CampaignStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return {
          icon: CheckCircle2,
          label: 'Live',
          emoji: '🟢',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
        };
      case 'FAILED':
        return {
          icon: XCircle,
          label: 'Failed',
          emoji: '🔴',
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
        };
      case 'DRAFT':
        return {
          icon: FileEdit,
          label: 'Draft',
          emoji: '🟡',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200',
        };
      case 'PENDING':
      case 'GENERATING':
      case 'CREATING':
        return {
          icon: Clock,
          label: 'Pending',
          emoji: '🟡',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200',
        };
      case 'PAUSED':
        return {
          icon: Pause,
          label: 'Paused',
          emoji: '⚪',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
        };
      default:
        return {
          icon: Clock,
          label: status,
          emoji: '⚪',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}
    >
      <span>{config.emoji}</span>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}
