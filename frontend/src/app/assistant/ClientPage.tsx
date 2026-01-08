'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { chatApi } from '@/lib/api';
import { ConversationDetail, ConversationSummary, ChatMessage } from '@/types';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CheckCircle2, Lightbulb, AlertCircle, Copy, Star, Sparkles } from 'lucide-react';
import UpgradeModal from '@/components/UpgradeModal';
import UsageCounter from '@/components/UsageCounter';

function MessageBubble({ message, onFeedback }: { message: ChatMessage; onFeedback: (id: string, f: 'up' | 'down') => void }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const copyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slideUp opacity-0`} style={{ animation: 'slideUp 0.4s ease-out forwards' }}>
      <div className="flex flex-col gap-1 max-w-2xl w-full">
        <span className={`text-xs font-medium ${isUser ? 'text-teal-700' : 'text-gray-500'}`}>
          {isUser ? 'You' : 'Assistant'}
        </span>
        <div
          className={`rounded-lg px-5 py-4 shadow-sm border transition-colors group relative ${
            isUser
              ? 'bg-teal-600 text-white border-teal-500'
              : 'bg-white text-gray-900 border-gray-200'
          }`}
        >
          {!isUser ? (
            <div className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-800 prose-p:leading-relaxed prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-bold text-gray-900 mb-2 mt-4">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-semibold text-gray-800 mb-2 mt-3">{children}</h3>,
                  p: ({ children }) => <p className="text-gray-800 leading-relaxed mb-3">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                  ul: ({ children }) => <ul className="space-y-2 my-3">{children}</ul>,
                  ol: ({ children }) => <ol className="space-y-1.5 my-3 list-decimal list-inside">{children}</ol>,
                  li: ({ children, ...props }: any) => {
                    const content = String(children);
                    const isActionItem = content.toLowerCase().includes('pause') || 
                                        content.toLowerCase().includes('monitor') || 
                                        content.toLowerCase().includes('review') ||
                                        content.toLowerCase().includes('ensure') ||
                                        content.toLowerCase().includes('analyze') ||
                                        content.toLowerCase().includes('check');
                    const isOrdered = props.node?.tagName === 'li' && props.node?.parent?.tagName === 'ol';
                    return (
                      <li className="flex items-start gap-2.5 py-1">
                        {isOrdered ? (
                          <span className="flex-shrink-0 text-teal-700 font-semibold text-sm mt-0.5">
                            {content.match(/^\d+/)?.[0] || '•'}
                          </span>
                        ) : (
                          <span className="flex-shrink-0 mt-1">
                            {isActionItem ? (
                              <AlertCircle size={14} className="text-orange-500" />
                            ) : (
                              <CheckCircle2 size={14} className="text-teal-600" />
                            )}
                          </span>
                        )}
                        <span className="flex-1 text-gray-800 text-sm leading-relaxed">{children}</span>
                      </li>
                    );
                  },
                  code: ({ ...props }: any) => {
                    const inline = !props.className;
                    return inline ? (
                      <code className="px-1.5 py-0.5 rounded bg-gray-100 text-teal-700 text-xs font-mono">{props.children}</code>
                    ) : (
                      <code className="block px-3 py-2 rounded-lg bg-gray-900 text-gray-100 text-xs font-mono overflow-x-auto">{props.children}</code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
          )}

          {!isUser && (
            <button
              onClick={copyMessage}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-gray-100"
              title="Copy message"
            >
              {copied ? (
                <CheckCircle2 size={14} className="text-green-600" />
              ) : (
                <Copy size={14} className="text-gray-500" />
              )}
            </button>
          )}

          {!isUser && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
              <button
                aria-label="Helpful"
                className={`px-3 py-2 md:py-1.5 rounded-full border transition-all ${message.feedback === 'up' ? 'border-teal-500 text-teal-700 bg-teal-50 font-medium' : 'border-gray-200 bg-gray-50 hover:border-teal-300 hover:bg-teal-50'}`}
                onClick={() => onFeedback(message.id, 'up')}
              >
                👍 Helpful
              </button>
              <button
                aria-label="Not helpful"
                className={`px-3 py-2 md:py-1.5 rounded-full border transition-all ${message.feedback === 'down' ? 'border-red-500 text-red-700 bg-red-50 font-medium' : 'border-gray-200 bg-gray-50 hover:border-red-300 hover:bg-red-50'}`}
                onClick={() => onFeedback(message.id, 'down')}
              >
                👎 Not helpful
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AssistantPage() {
  const [history, setHistory] = useState<ConversationSummary[]>([]);
  const [current, setCurrent] = useState<ConversationDetail | null>(null);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const searchParams = useSearchParams();
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [manualContext, setManualContext] = useState<{
    objective: 'LEADS' | 'WHATSAPP' | 'SALES';
    problemType: 'CREATIVE' | 'FUNNEL' | 'SALES';
    ctr: string;
    cpm: string;
    cpa: string;
  } | null>(null);
  const [contextForm, setContextForm] = useState({
    objective: 'LEADS' as 'LEADS' | 'WHATSAPP' | 'SALES',
    problemType: 'CREATIVE' as 'CREATIVE' | 'FUNNEL' | 'SALES',
    ctr: '',
    cpm: '',
    cpa: '',
  });
  const autoStartedRef = useRef(false);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [usageStats, setUsageStats] = useState({ apiUsageCount: 0, isPro: false });

  const hasMessages = useMemo(() => (current?.messages?.length || 0) > 0, [current]);
  const hasContext = useMemo(() => !!analysisId || manualContext !== null, [analysisId, manualContext]);

  const loadHistory = async (preferredId?: string | null) => {
    try {
      const resp = await chatApi.getHistory();
      setHistory(resp.data || []);
      // Only load specific conversation if explicitly requested via URL
      const targetId = preferredId || searchParams.get('conversationId');
      if (targetId && resp.data?.length) {
        const match = resp.data.find((h: ConversationSummary) => h.id === targetId);
        if (match) {
          void loadConversation(match.id);
          setIsSidebarOpen(false);
        }
      }
    } catch (e) {
      toast.error('Failed to load conversations');
    }
  };

  const loadConversation = async (conversationId: string) => {
    setIsLoading(true);
    try {
      const resp = await chatApi.getConversation(conversationId);
      setCurrent(resp.data);
      setIsSidebarOpen(false);
    } catch (e) {
      toast.error('Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsageStats = async () => {
    try {
      const resp = await chatApi.getUsage();
      setUsageStats({
        apiUsageCount: resp.data.apiUsageCount || 0,
        isPro: resp.data.isPro || false,
      });
    } catch (e) {
      // Silently fail
    }
  };

  useEffect(() => {
    void loadHistory(searchParams.get('conversationId'));
    void loadUsageStats();
    const urlAnalysisId = searchParams.get('analysisId');
    if (urlAnalysisId) {
      setAnalysisId(urlAnalysisId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (analysisId && !current?.conversationId && !autoStartedRef.current) {
      autoStartedRef.current = true;
      setTimeout(() => {
        void handleSend(true);
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisId, current?.conversationId]);

  const handleSend = async (isAutoStart = false) => {
    const baseMessage = isAutoStart
      ? 'I just analyzed my ad and got the diagnosis. Based on the metrics and recommended fix, what should I do first to implement this?'
      : input.trim();

    if (!baseMessage) return;

    const contextPrefix = analysisId
      ? ''
      : manualContext
        ? `Context: objective ${manualContext.objective}, problem ${manualContext.problemType}, CTR ${manualContext.ctr}%, CPM ${manualContext.cpm}, CPA ${manualContext.cpa}. `
        : '';

    const message = `${contextPrefix}${baseMessage}`;
    setIsSending(true);
    try {
      const resp = await chatApi.sendMessage(message, current?.conversationId, analysisId || undefined);
      const convoId = resp.data.conversationId as string;
      const newMessages = resp.data.messages as ChatMessage[];

      if (analysisId) setAnalysisId(null);

      const displayMessages = isAutoStart
        ? newMessages.filter((m) => m.role === 'assistant')
        : newMessages;

      setCurrent((prev) => ({
        conversationId: convoId,
        title: prev?.title,
        messages: [...(prev?.messages || []), ...displayMessages],
      }));
      setHistory((prev) => {
        const others = prev.filter((h) => h.id !== convoId);
        const title = prev.find((h) => h.id === convoId)?.title || newMessages[0]?.content.slice(0, 40) || 'Conversation';
        return [
          {
            id: convoId,
            title,
            lastMessage: newMessages[newMessages.length - 1]?.content || '',
            updatedAt: new Date().toISOString(),
          },
          ...others,
        ];
      });
      if (!isAutoStart) setInput('');
      void loadUsageStats(); // Refresh usage stats
    } catch (e: any) {
      if (!isAutoStart) {
        const status = e?.response?.status;
        const msg = e?.response?.data?.message || 'Failed to send message';
        
        if (status === 429) {
          // Daily limit reached
          setShowUpgradeModal(true);
          toast.error('Daily limit reached. Upgrade to Pro for unlimited questions!');
        } else {
          toast.error(msg);
        }
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleFeedback = async (messageId: string, feedback: 'up' | 'down') => {
    try {
      await chatApi.sendFeedback(messageId, feedback);
      setCurrent((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.map((m) => (m.id === messageId ? { ...m, feedback } : m)),
            }
          : prev
      );
    } catch (e) {
      toast.error('Failed to save feedback');
    }
  };

  const handleUpgradeComplete = () => {
    void loadUsageStats();
    toast.success('Welcome to Jupho Pro! You now have unlimited questions.');
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await chatApi.exportJsonl();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'chat-export.jsonl';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-base font-bold text-gray-900">AI Assistant</h1>
        </div>
        <UsageCounter
          isPro={usageStats.isPro}
          usageCount={usageStats.apiUsageCount}
          limit={10}
          onUpgradeClick={() => setShowUpgradeModal(true)}
          compact
        />
      </div>

      <main className="flex-1 max-w-6xl mx-auto px-0 md:px-4 py-0 md:py-6 grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-6 w-full overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        <div
          className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          onClick={() => setIsSidebarOpen(false)}
        />

        <aside
          className={`fixed md:relative inset-y-0 left-0 w-4/5 max-w-sm md:w-auto bg-white border-r md:border border-gray-200 md:rounded-lg p-4 md:col-span-1 z-50 md:z-0 overflow-y-auto h-full transform transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
          aria-label="Conversations"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Chat History</h2>
              <p className="text-xs text-gray-500">{history.length} conversation{history.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCurrent(null);
                  setInput('');
                  setIsSidebarOpen(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-medium hover:bg-teal-700 transition-colors shadow-sm"
              >
                + New Chat
              </button>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {history.map((item, index) => (
              <button
                key={item.id}
                onClick={() => void loadConversation(item.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors group relative overflow-hidden ${
                  current?.conversationId === item.id
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-teal-600 bg-white'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900 truncate flex-1">{item.title || 'Untitled Chat'}</p>
                  <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                    {new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{item.lastMessage}</p>
              </button>
            ))}
            {!history.length && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 mb-2">No conversations yet</p>
                <p className="text-xs text-gray-400">Start chatting to see your history here</p>
              </div>
            )}
          </div>

          {/* Saved Prompts Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Star size={16} className="text-yellow-500" />
              <h3 className="text-sm font-semibold text-gray-900">Quick Prompts</h3>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setInput("My CTR is 0.8%. Should I change the visual or the headline first?")}
                className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 hover:border-teal-400 hover:bg-teal-50 transition-colors group"
              >
                <p className="text-xs font-medium text-gray-900 group-hover:text-teal-700">⚡ CTR Decision</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Visual or headline first?</p>
              </button>
              <button
                onClick={() => setInput("I changed my budget from ₹500 to ₹1500. CPA jumped from ₹80 to ₹180. Should I revert?")}
                className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 hover:border-teal-400 hover:bg-teal-50 transition-colors group"
              >
                <p className="text-xs font-medium text-gray-900 group-hover:text-teal-700">💰 Budget Fix</p>
                <p className="text-[10px] text-gray-500 mt-0.5">CPA spiked after change</p>
              </button>
              <button
                onClick={() => setInput("My ad has been running 4 days. CTR is 1.2%, no conversions yet. Pause or keep running?")}
                className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 hover:border-teal-400 hover:bg-teal-50 transition-colors group"
              >
                <p className="text-xs font-medium text-gray-900 group-hover:text-teal-700">⏸️ Pause Decision</p>
                <p className="text-[10px] text-gray-500 mt-0.5">4 days, no conversions</p>
              </button>
              <button
                onClick={() => setInput("Which CTA converts better for coaching: 'Book Free Call' or 'Download Guide'?")}
                className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 hover:border-teal-400 hover:bg-teal-50 transition-colors group"
              >
                <p className="text-xs font-medium text-gray-900 group-hover:text-teal-700">🎯 CTA Choice</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Pick winning CTA</p>
              </button>
            </div>
          </div>

          <div className="hidden md:block mt-4">
            <UsageCounter
              isPro={usageStats.isPro}
              usageCount={usageStats.apiUsageCount}
              limit={10}
              onUpgradeClick={() => setShowUpgradeModal(true)}
            />
          </div>
        </aside>

        <section className="md:col-span-3 bg-white border-0 md:border border-gray-200 md:rounded-lg p-4 md:p-5 flex flex-col gap-4 h-full md:shadow-sm overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1" aria-live="polite">
            {isLoading && (
              <div className="space-y-3" aria-label="Loading messages">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`flex ${i % 2 ? 'justify-end' : 'justify-start'}`}>
                    <div className="card px-4 py-3 max-w-xl w-full md:w-2/3">
                      <div className="skeleton h-4 w-5/6" />
                      <div className="skeleton h-4 w-2/3 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!isLoading && !hasMessages && (
              <div className="flex flex-col items-center justify-center h-full py-8 md:py-12">
                <div className="max-w-2xl w-full space-y-6">
                  {/* Hero Section */}
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-lg bg-teal-600 flex items-center justify-center shadow-sm">
                      <Lightbulb className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">What decision can I help you make?</h2>
                    <p className="text-sm text-gray-600 max-w-md mx-auto">
                      Ask me anything about your Meta ads. I\'ll help you execute fixes and make fast decisions.
                    </p>
                  </div>

                  {/* Optional Context Form */}
                  {!analysisId && !manualContext && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">💡 Add Context (Optional)</p>
                          <p className="text-xs text-gray-600">For more precise advice, add your ad metrics</p>
                        </div>
                        <span className="text-[11px] font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">Optional</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">Objective</label>
                          <select
                            value={contextForm.objective}
                            onChange={(e) => setContextForm((prev) => ({ ...prev, objective: e.target.value as any }))}
                            className="w-full border border-gray-300 rounded-md text-sm px-2 py-2 focus:border-teal-500 focus:ring-1 focus:ring-teal-200"
                          >
                            <option value="LEADS">Leads</option>
                            <option value="WHATSAPP">WhatsApp</option>
                            <option value="SALES">Sales</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">Problem</label>
                          <select
                            value={contextForm.problemType}
                            onChange={(e) => setContextForm((prev) => ({ ...prev, problemType: e.target.value as any }))}
                            className="w-full border border-gray-300 rounded-md text-sm px-2 py-2 focus:border-teal-500 focus:ring-1 focus:ring-teal-200"
                          >
                            <option value="CREATIVE">Creative</option>
                            <option value="FUNNEL">Funnel</option>
                            <option value="SALES">Sales/Follow-up</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700">CTR %</label>
                            <input
                              type="number"
                              step="0.01"
                              value={contextForm.ctr}
                              onChange={(e) => setContextForm((prev) => ({ ...prev, ctr: e.target.value }))}
                              className="w-full border border-gray-300 rounded-md text-sm px-2 py-2 focus:border-teal-500 focus:ring-1 focus:ring-teal-200"
                              placeholder="1.2"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700">CPM</label>
                            <input
                              type="number"
                              step="0.01"
                              value={contextForm.cpm}
                              onChange={(e) => setContextForm((prev) => ({ ...prev, cpm: e.target.value }))}
                              className="w-full border border-gray-300 rounded-md text-sm px-2 py-2 focus:border-teal-500 focus:ring-1 focus:ring-teal-200"
                              placeholder="280"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700">CPA</label>
                            <input
                              type="number"
                              step="0.01"
                              value={contextForm.cpa}
                              onChange={(e) => setContextForm((prev) => ({ ...prev, cpa: e.target.value }))}
                              className="w-full border border-gray-300 rounded-md text-sm px-2 py-2 focus:border-teal-500 focus:ring-1 focus:ring-teal-200"
                              placeholder="120"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={() => {
                            if (!contextForm.ctr || !contextForm.cpm || !contextForm.cpa) {
                              toast.error('Fill CTR, CPM, and CPA to add context.');
                              return;
                            }
                            setManualContext(contextForm);
                            toast.success('Context added! I\'ll use this for precise advice.');
                          }}
                          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Add Context
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quick Prompts */}
                  <div className="space-y-3">
                    <p className="text-xs md:text-sm font-semibold text-gray-700 px-2">✨ Example decisions I help with:</p>
                    <div className="grid grid-cols-1 gap-2.5">
                      <button
                        onClick={() => setInput("My CTR dropped from 2% to 0.9% after changing the hook. Should I revert or wait 48 hours?")}
                        className="group flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-white hover:border-teal-600 hover:bg-teal-50 transition-colors text-left shadow-sm"
                      >
                        <span className="text-2xl">🔄</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-teal-700">"CTR dropped from 2% to 0.9%. Revert or wait?"</p>
                          <p className="text-xs text-gray-500 mt-0.5">Fast decisions on performance drops</p>
                        </div>
                      </button>
                      <button
                        onClick={() => setInput("Which headline converts better for a ₹500 product: 'Save 40%' or 'Limited Stock'?")}
                        className="group flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-white hover:border-green-600 hover:bg-green-50 transition-colors text-left shadow-sm"
                      >
                        <span className="text-2xl">⚖️</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-green-700">"Which headline converts better: 'Save 40%' or 'Limited Stock'?"</p>
                          <p className="text-xs text-gray-500 mt-0.5">Compare specific options</p>
                        </div>
                      </button>
                      <button
                        onClick={() => setInput("I'm getting 2% CTR but 0 conversions. Should I fix the landing page or creative first?")}
                        className="group flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-white hover:border-purple-600 hover:bg-purple-50 transition-colors text-left shadow-sm"
                      >
                        <span className="text-2xl">🎯</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-purple-700">"2% CTR but 0 conversions. Fix landing page or creative first?"</p>
                          <p className="text-xs text-gray-500 mt-0.5">Prioritize fixes</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Info Banner */}
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 md:p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <AlertCircle size={16} className="text-teal-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs md:text-sm font-medium text-teal-900">💡 Last 5 messages kept for context</p>
                        <p className="text-xs text-teal-700">Free plan: 10 questions/day</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {!isLoading && current?.messages?.map((m) => (
              <MessageBubble key={m.id} message={m} onFeedback={handleFeedback} />
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="flex flex-col gap-1 max-w-xl">
                  <span className="text-xs font-medium text-gray-500">
                    Assistant
                  </span>
                  <div className="rounded-2xl px-4 py-3 shadow-sm border bg-white text-gray-900 border-gray-200">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4 sticky bottom-0 bg-white">
            {analysisId && (
              <div className="bg-gradient-to-r from-teal-50 to-purple-50 border-2 border-teal-300 rounded-lg px-4 py-3 flex items-center justify-between mb-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Connected to your analysis</p>
                    <p className="text-xs text-gray-600">I have all your metrics and diagnosis. Let's implement the fix!</p>
                  </div>
                </div>
                <button
                  onClick={() => setAnalysisId(null)}
                  className="text-xs text-gray-500 hover:text-gray-700 font-medium p-2 hover:bg-white/50 rounded"
                >
                  ✕
                </button>
              </div>
            )}
            {!analysisId && manualContext && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs font-medium text-amber-800">
                    Manual metrics attached: {manualContext.problemType} | CTR {manualContext.ctr}% | CPM {manualContext.cpm} | CPA {manualContext.cpa}
                  </span>
                </div>
                <button
                  onClick={() => setManualContext(null)}
                  className="text-xs text-amber-700 hover:text-amber-900 font-medium"
                >
                  ✕
                </button>
              </div>
            )}
            
            <div className="relative">
              <textarea
                className="w-full border-2 border-gray-300 rounded-lg p-3 pr-24 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 resize-none shadow-sm transition-colors bg-white placeholder:text-gray-400"
                rows={3}
                placeholder="Ask about a specific decision or fix (e.g., 'Should I pause this ad?')..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!isSending && input.trim()) void handleSend();
                  }
                }}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    setCurrent(null);
                    setInput('');
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-1 hover:bg-gray-100 rounded transition-colors"
                  title="Clear chat"
                >
                  Clear
                </button>
                <button
                  onClick={() => void handleSend()}
                  disabled={isSending || !input.trim()}
                  className="px-4 py-1.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  title={isSending ? 'Sending...' : 'Send message (Enter)'}
                >
                  {isSending ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending</span>
                    </>
                  ) : (
                    <>
                      <span>Send</span>
                      <span className="text-xs opacity-75">↵</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="mt-2 px-1 flex items-center justify-between text-xs text-gray-500">
              <span>💬 Last 5 messages kept • Free: 10 questions/day</span>
            </div>
          </div>
        </section>
      </main>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgradeComplete={handleUpgradeComplete}
      />
    </div>
  );
}
