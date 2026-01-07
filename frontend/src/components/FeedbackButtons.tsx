'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { trackingApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface FeedbackButtonsProps {
  analysisId: string;
}

export function FeedbackButtons({ analysisId }: FeedbackButtonsProps) {
  const [feedback, setFeedback] = useState<boolean | null>(null);

  const handleFeedback = async (fixWorked: boolean) => {
    setFeedback(fixWorked);
    await trackingApi.trackFeedback(analysisId, fixWorked);
    toast.success(fixWorked ? 'Thanks! Glad it worked!' : 'Thanks for the feedback');
  };

  if (feedback !== null) {
    return (
      <div className="flex items-center gap-2 py-3 px-4 bg-gray-50 border border-gray-200 rounded-lg">
        <span className="text-sm text-gray-600">
          {feedback ? '✓ Marked as helpful' : '✓ Feedback recorded'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 py-3 px-4 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-sm font-medium text-gray-700">Did this fix work?</p>
      <div className="flex gap-2">
        <button
          onClick={() => handleFeedback(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-green-50 hover:border-green-300 transition-colors"
        >
          <ThumbsUp size={16} />
          Yes, it worked
        </button>
        <button
          onClick={() => handleFeedback(false)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:border-red-300 transition-colors"
        >
          <ThumbsDown size={16} />
          No, still struggling
        </button>
      </div>
    </div>
  );
}
