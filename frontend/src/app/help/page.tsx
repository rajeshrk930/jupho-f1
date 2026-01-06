'use client';

import { useState } from 'react';
import { Search, Book, Video, Mail, MessageCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How do I analyze my first ad creative?',
        a: 'Go to the Analyze page, upload your creative (image or video), fill in the metrics (CTR, CPM, CPA), select your objective and industry, then click Analyze. You\'ll get instant insights on why it performed the way it did.'
      },
      {
        q: 'What metrics do I need to provide?',
        a: 'You need to provide CTR (Click-Through Rate), CPM (Cost Per Thousand Impressions), and CPA (Cost Per Acquisition). These can be found in your Meta Ads Manager.'
      },
      {
        q: 'What file formats are supported?',
        a: 'We support JPG, PNG, WEBP for images and MP4, MOV for videos. Maximum file size is 10MB.'
      }
    ]
  },
  {
    category: 'AI Assistant',
    questions: [
      {
        q: 'How many questions can I ask the AI?',
        a: 'Free plan users get 10 questions per day. Pro users get unlimited questions. Your daily limit resets at midnight IST.'
      },
      {
        q: 'What kind of questions can I ask?',
        a: 'You can ask about creative strategy, copy optimization, targeting suggestions, ad performance analysis, and general Meta Ads best practices.'
      },
      {
        q: 'How does the AI remember context?',
        a: 'The AI keeps the last 5 messages in context. If you\'re discussing a specific analysis, it will remember details from that analysis.'
      }
    ]
  },
  {
    category: 'Pricing & Billing',
    questions: [
      {
        q: 'How much does Jupho Pro cost?',
        a: 'Jupho Pro costs ₹999/month. You get unlimited AI questions, priority support, advanced features, and unlimited report exports.'
      },
      {
        q: 'Can I cancel anytime?',
        a: 'Yes, you can cancel your Pro subscription anytime from the Billing page. You\'ll continue to have Pro access until the end of your billing period.'
      },
      {
        q: 'Do you offer refunds?',
        a: 'We offer refunds within 7 days of purchase if you\'re not satisfied with the service. Contact support for refund requests.'
      }
    ]
  },
  {
    category: 'Analysis & Reports',
    questions: [
      {
        q: 'How accurate are the analysis results?',
        a: 'Our analysis engine uses proven Meta Ads best practices and industry benchmarks. Results are based on the metrics you provide and common patterns in successful ad creatives.'
      },
      {
        q: 'Can I export my analysis as PDF?',
        a: 'Yes, every analysis has an export button that generates a professional PDF report you can share with clients or team members.'
      },
      {
        q: 'How long is my analysis history saved?',
        a: 'All your analyses are saved permanently in your account. You can access them anytime from the History page.'
      }
    ]
  },
  {
    category: 'Account & Security',
    questions: [
      {
        q: 'How do I change my password?',
        a: 'Go to Settings > Change Password. Enter your current password, then your new password twice to confirm.'
      },
      {
        q: 'Is my data secure?',
        a: 'Yes, we use industry-standard encryption for all data. Your creatives and analyses are stored securely and never shared with third parties.'
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes, you can delete your account from Settings > Data & Privacy. This will permanently delete all your data.'
      }
    ]
  }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Getting Started');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-6">
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Help Center</h1>
          <p className="text-lg text-gray-600">Find answers to common questions and get support</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base shadow-sm"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <a
            href="mailto:support@jupho.com"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-teal-600 transition-colors group shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
              <Mail size={24} className="text-teal-700" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
            <p className="text-sm text-gray-600">Get help via email</p>
            <p className="text-sm text-teal-700 mt-2 group-hover:underline">support@jupho.com</p>
          </a>

          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-teal-600 transition-colors group shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
              <Video size={24} className="text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Video Tutorials</h3>
            <p className="text-sm text-gray-600">Watch step-by-step guides</p>
            <p className="text-sm text-teal-700 mt-2 group-hover:underline inline-flex items-center gap-1">
              Watch now <ExternalLink size={14} />
            </p>
          </a>

          <a
            href="https://discord.gg/jupho"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-teal-600 transition-colors group shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <MessageCircle size={24} className="text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Community</h3>
            <p className="text-sm text-gray-600">Join our Discord server</p>
            <p className="text-sm text-teal-700 mt-2 group-hover:underline inline-flex items-center gap-1">
              Join now <ExternalLink size={14} />
            </p>
          </a>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
                <Book size={20} className="text-teal-700" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
                <p className="text-sm text-gray-600">Browse common questions by category</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredFaqs.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">No results found for "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-teal-700 hover:text-teal-600 text-sm mt-2"
                >
                  Clear search
                </button>
              </div>
            ) : (
              filteredFaqs.map((category) => (
                <div key={category.category}>
                  <button
                    onClick={() => setExpandedCategory(
                      expandedCategory === category.category ? null : category.category
                    )}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{category.category}</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {category.questions.length}
                      </span>
                    </div>
                    {expandedCategory === category.category ? (
                      <ChevronUp size={20} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-400" />
                    )}
                  </button>

                  {expandedCategory === category.category && (
                    <div className="px-6 pb-4 space-y-3">
                      {category.questions.map((item, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg">
                          <button
                            onClick={() => setExpandedQuestion(
                              expandedQuestion === `${category.category}-${idx}` 
                                ? null 
                                : `${category.category}-${idx}`
                            )}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between gap-3"
                          >
                            <span className="font-medium text-gray-900">{item.q}</span>
                            {expandedQuestion === `${category.category}-${idx}` ? (
                              <ChevronUp size={16} className="text-gray-400 flex-shrink-0" />
                            ) : (
                              <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                            )}
                          </button>

                          {expandedQuestion === `${category.category}-${idx}` && (
                            <div className="px-4 pb-3">
                              <p className="text-gray-700 leading-relaxed">{item.a}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-teal-50 border border-teal-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Still need help?</h2>
          <p className="text-gray-700 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <a
            href="mailto:support@jupho.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm"
          >
            <Mail size={18} />
            Contact Support
          </a>
        </div>
      </main>
    </div>
  );
}
