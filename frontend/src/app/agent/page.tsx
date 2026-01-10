'use client';

import { useState, useEffect, useRef } from 'react';
import { agentApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Loader2, Sparkles, Upload, CheckCircle2, XCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

interface GeneratedContent {
  headlines: string[];
  primaryTexts: string[];
  descriptions: string[];
  reasoning?: string;
}

export default function AgentPage() {
  const router = useRouter();
  const [taskId, setTaskId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [state, setState] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [creativeFile, setCreativeFile] = useState<File | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [taskHistory, setTaskHistory] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    startNewTask();
  }, []);

  const startNewTask = async () => {
    try {
      setLoading(true);
      const response = await agentApi.startTask();
      setTaskId(response.taskId);
      setState(response.state);
      setMessages([{
        role: 'agent',
        content: response.message,
        timestamp: new Date()
      }]);
    } catch (error: any) {
      console.error('Failed to start task:', error);
      alert(error.response?.data?.error || 'Failed to start agent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !taskId || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to chat
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    try {
      setLoading(true);
      const response = await agentApi.sendMessage(taskId, userMessage);
      
      // Add agent response
      setMessages(prev => [...prev, {
        role: 'agent',
        content: response.message,
        timestamp: new Date()
      }]);

      setState(response.state);

      // If generated content is returned, show it
      if (response.generatedContent) {
        setGeneratedContent(response.generatedContent);
      }

      // If action is to create ad, trigger creation
      if (response.action === 'CREATE_AD') {
        await handleCreateAd();
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        role: 'agent',
        content: `❌ Error: ${error.response?.data?.error || 'Failed to process your message. Please try again.'}`,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAd = async () => {
    if (!taskId) return;

    try {
      setCreating(true);
      setMessages(prev => [...prev, {
        role: 'agent',
        content: '🚀 Creating your ad on Facebook... This may take a moment.',
        timestamp: new Date()
      }]);

      const response = await agentApi.createAd(taskId, creativeFile || undefined);
      
      setMessages(prev => [...prev, {
        role: 'agent',
        content: response.message,
        timestamp: new Date()
      }]);

      setState(response.state);
    } catch (error: any) {
      console.error('Failed to create ad:', error);
      setMessages(prev => [...prev, {
        role: 'agent',
        content: `❌ Failed to create ad: ${error.response?.data?.error || 'Unknown error occurred'}`,
        timestamp: new Date()
      }]);
    } finally {
      setCreating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCreativeFile(e.target.files[0]);
      setMessages(prev => [...prev, {
        role: 'user',
        content: `📎 Uploaded: ${e.target.files![0].name}`,
        timestamp: new Date()
      }]);
    }
  };

  const loadTaskHistory = async () => {
    try {
      const response = await agentApi.getTasks(10);
      setTaskHistory(response.tasks);
      setShowHistory(true);
    } catch (error: any) {
      console.error('Failed to load task history:', error);
      alert('Failed to load task history');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-coral-500" />
                <div>
                  <h1 className="text-xl font-bold">AI Agent</h1>
                  <p className="text-sm text-charcoal-600">Auto-create Meta ads with AI</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadTaskHistory}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                History
              </button>
              <button
                onClick={() => {
                  if (confirm('Start a new conversation?')) {
                    setMessages([]);
                    setGeneratedContent(null);
                    setCreativeFile(null);
                    startNewTask();
                  }
                }}
                className="px-4 py-2 text-sm bg-coral-500 text-white hover:bg-coral-600 rounded-lg transition-colors"
              >
                New Task
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              {/* Messages */}
              <div className="h-[600px] overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-coral-500 text-white'
                          : 'bg-gray-50 text-charcoal-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {msg.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-50 rounded-2xl px-4 py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-coral-500" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t p-4 bg-gray-50">
                {creativeFile && (
                  <div className="mb-3 flex items-center gap-2 text-sm text-gray-600 bg-white p-2 rounded-lg">
                    <Upload className="w-4 h-4" />
                    <span>{creativeFile.name}</span>
                    <button
                      onClick={() => setCreativeFile(null)}
                      className="ml-auto text-red-500 hover:text-red-700"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="creative-upload"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="creative-upload"
                    className="flex items-center justify-center w-12 h-12 bg-white border rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <Upload className="w-5 h-5 text-gray-500" />
                  </label>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={loading || creating}
                    className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-coral-500 disabled:bg-gray-100"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading || creating}
                    className="flex items-center justify-center w-12 h-12 bg-coral-500 text-white rounded-xl hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading || creating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="font-semibold mb-4">Status</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${taskId ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-gray-600">Task Active</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${state === 'COMPLETED' ? 'bg-mint-500' : 'bg-coral-400'}`}></div>
                  <span className="text-charcoal-600">{state || 'Initializing'}</span>
                </div>
              </div>
            </div>

            {/* Generated Variants Preview */}
            {generatedContent && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="font-semibold mb-4">Generated Variants</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Headlines</h3>
                    <div className="space-y-2">
                      {generatedContent.headlines.map((h, i) => (
                        <div key={i} className="text-xs bg-gray-50 p-2 rounded">
                          {i + 1}. {h}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Primary Text</h3>
                    <div className="space-y-2">
                      {generatedContent.primaryTexts.map((t, i) => (
                        <div key={i} className="text-xs bg-gray-50 p-2 rounded">
                          {i + 1}. {t}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Descriptions</h3>
                    <div className="space-y-2">
                      {generatedContent.descriptions.map((d, i) => (
                        <div key={i} className="text-xs bg-gray-50 p-2 rounded">
                          {i + 1}. {d}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Help Card */}
            <div className="bg-gradient-to-br from-coral-50 to-mint-50 rounded-2xl border border-coral-100 p-6">
              <h2 className="font-semibold mb-2 text-charcoal-900">How it works</h2>
              <ul className="text-sm text-charcoal-700 space-y-2">
                <li>• Answer questions about your ad</li>
                <li>• AI generates copy variants</li>
                <li>• Review and approve</li>
                <li>• Ad created on Facebook</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Task History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Task History</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {taskHistory.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No task history yet</p>
              ) : (
                <div className="space-y-4">
                  {taskHistory.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          task.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {task.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {task.input && (
                        <div className="text-sm text-gray-600">
                          <strong>Objective:</strong> {JSON.parse(task.input).objective}
                        </div>
                      )}
                      {task.output && JSON.parse(task.output).fbAdId && (
                        <div className="text-xs text-gray-500 mt-1">
                          Ad ID: {JSON.parse(task.output).fbAdId}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
