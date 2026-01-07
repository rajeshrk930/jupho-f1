'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { chatApi, trackingApi } from '@/lib/api';
import { Analysis, ChatMessage } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';

interface InlineChatProps {
  analysis: Analysis;
}

export function InlineChat({ analysis }: InlineChatProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [hasTrackedOpen, setHasTrackedOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isExpanded && messages.length === 0) {
      // Track AI chat opened for training data
      if (!hasTrackedOpen) {
        trackingApi.trackAction(analysis.id, 'openedAI');
        trackingApi.trackAction(analysis.id, 'clickedImplement');
        setHasTrackedOpen(true);
      }

      // Add initial AI message
      const initialMessage: ChatMessage = {
        id: 'initial',
        role: 'assistant',
        content: `I analyzed your ad creative and found: **${analysis.primaryReason}**\n\n${analysis.additionalNotes ? 'I\'ve prepared a detailed creative brief for you. ' : ''}Would you like help implementing the fix? I can:\n\n• Walk you through the creative brief step-by-step\n• Answer questions about the metrics\n• Suggest alternative approaches\n• Help you understand what to prioritize`,
        createdAt: new Date().toISOString(),
      };
      setMessages([initialMessage]);
    }
  }, [isExpanded, messages.length, analysis, hasTrackedOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    const tempUserMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(
        userMessage,
        conversationId || undefined,
        analysis.id
      );

      if (response.success && response.data) {
        // Update conversation ID
        if (!conversationId && response.data.conversationId) {
          setConversationId(response.data.conversationId);
        }

        // Add assistant message
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.data.reply,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error('Daily limit reached. Upgrade to Pro for unlimited questions.');
      } else {
        toast.error('Failed to send message');
      }
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 hover:border-purple-300 transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                Need help implementing this fix?
                <ChevronDown className="w-4 h-4 text-purple-600 group-hover:translate-y-0.5 transition-transform" />
              </p>
              <p className="text-sm text-gray-600">Step-by-step guidance • ⏱ 5-10 min</p>
            </div>
          </div>
          <MessageSquare className="w-5 h-5 text-purple-600" />
        </div>
      </button>
    );
  }

  return (
    <div className="mt-6 border-2 border-purple-200 rounded-lg bg-white shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold">AI Assistant</span>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Context-aware</span>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="p-1 hover:bg-white/20 rounded transition-colors"
        >
          <ChevronUp className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-3 bg-white">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this analysis..."
            className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
