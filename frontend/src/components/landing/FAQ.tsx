'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Do I need design skills to use Jupho?',
    answer: 'Not at all! Jupho is built for business owners with zero design experience. Just answer simple questions about your business, and our AI handles everything—copy, headlines, targeting strategy, and ad creation.'
  },
  {
    question: 'What\'s the difference between BASIC and GROWTH plans?',
    answer: 'BASIC gives you templates-based campaign creation (fast and proven). GROWTH adds the AI Agent that intelligently creates campaigns from scratch, generates custom copy, and provides strategic recommendations. GROWTH also includes more campaigns (25 vs 10) and priority support.'
  },
  {
    question: 'Can I start with FREE and upgrade later?',
    answer: 'Absolutely! Start with the FREE plan (2 campaigns/month) to test Jupho. When you\'re ready to scale, upgrade to BASIC or GROWTH anytime. All your data and campaigns are preserved.'
  },
  {
    question: 'How is this different from hiring an agency?',
    answer: 'Agencies charge ₹20,000-50,000/month plus setup fees and take days to create ads. With Jupho, you get instant results for ₹1,499-1,999/month, full control over your campaigns, and can create ads whenever you need them—no waiting.'
  },
  {
    question: 'Do I need a Facebook Ad Account?',
    answer: 'Yes, you\'ll need a Facebook Business Manager account with an active ad account. If you don\'t have one, we\'ll guide you through creating it for free. It only takes 5 minutes.'
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes! There are no long-term contracts. You can cancel your BASIC or GROWTH subscription anytime from your billing page. You\'ll continue to have access until the end of your billing period.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-charcoal-900 mb-4 tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-xl text-charcoal-600">
          Everything you need to know about Jupho
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden transition-all hover:shadow-lg"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-charcoal-900 pr-4">
                {faq.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-charcoal-600 flex-shrink-0 transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === index && (
              <div className="px-6 pb-5 text-charcoal-700 leading-relaxed">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-charcoal-600 mb-4">Still have questions?</p>
        <a
          href="https://app.jupho.io/help"
          className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold"
        >
          Visit our Help Center →
        </a>
      </div>
    </section>
  );
}
