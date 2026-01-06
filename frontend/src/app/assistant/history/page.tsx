'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { chatApi } from '@/lib/api';
import { ConversationSummary } from '@/types';
import toast from 'react-hot-toast';

export default function ChatHistoryPage() {
  const [rows, setRows] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const resp = await chatApi.getHistory();
      setRows(resp.data || []);
    } catch (e) {
      toast.error('Failed to load chat history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const fmt = (iso?: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Chat history</h1>
              <p className="text-sm text-gray-500">All conversations with the assistant.</p>
            </div>
            <Link href="/assistant" className="btn-primary text-sm">New chat</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600 text-xs font-medium">
                <tr>
                  <th className="px-4 py-3 w-[32%]">Title</th>
                  <th className="px-4 py-3 w-[40%]">Last message</th>
                  <th className="px-4 py-3 w-[18%]">Updated</th>
                  <th className="px-4 py-3 w-[10%] text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.id} className={`border-t border-gray-100 hover:bg-gray-50/80 transition ${idx % 2 ? 'bg-white' : 'bg-gray-50/40'}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 truncate">{row.title || 'Conversation'}</div>
                      <div className="text-xs text-gray-500">{row.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-700 line-clamp-2 whitespace-pre-wrap">{row.lastMessage || '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{fmt(row.updatedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/assistant?conversationId=${row.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500 text-sm" colSpan={4}>
                      {isLoading ? 'Loading…' : 'No conversations yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
