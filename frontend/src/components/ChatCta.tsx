'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export function ChatCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs drop-shadow-lg">
      <div className="rounded-2xl bg-white/95 backdrop-blur border border-blue-100 p-4 space-y-2 animate-[fadeIn_240ms_ease-out]">
        <div className="text-xs uppercase tracking-[0.08em] text-blue-600 font-semibold">Need a hand?</div>
        <div className="text-sm text-gray-800 leading-snug">
          Ask the AI assistant for a quick fix before you launch.
        </div>
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/assistant"
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Open Assistant
          </Link>
          <button
            type="button"
            aria-label="Hide assistant prompt"
            className="text-xs text-gray-500 hover:text-gray-700"
            onClick={() => setShow(false)}
          >
            Hide
          </button>
        </div>
      </div>
    </div>
  );
}
