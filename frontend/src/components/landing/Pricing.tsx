import { Check, X, Zap, Sparkles } from 'lucide-react';

export default function Pricing() {
  return (
    <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-charcoal-900 mb-4 tracking-tight">
          Simple, Transparent Pricing
        </h2>
        <p className="text-xl text-charcoal-600 max-w-2xl mx-auto">
          Start free, upgrade when you're ready to scale
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* FREE Plan */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200 hover:border-gray-300 transition-all">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-charcoal-900 mb-2">FREE</h3>
            <div className="flex items-baseline mb-4">
              <span className="text-5xl font-bold text-charcoal-900">₹0</span>
              <span className="text-charcoal-600 ml-2">/forever</span>
            </div>
            <p className="text-sm text-charcoal-600">Perfect for trying out Jupho</p>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-charcoal-700"><strong>2 campaigns</strong> per month</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-charcoal-700">Templates preview</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-charcoal-700">Basic campaign creation</span>
            </li>
            <li className="flex items-start gap-2">
              <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-400">No AI Agent</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-charcoal-700">Community support</span>
            </li>
          </ul>

          <a
            href="https://app.jupho.io/sign-up"
            className="block w-full text-center bg-gray-100 text-charcoal-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Start Free
          </a>
        </div>

        {/* BASIC Plan */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-blue-200 hover:border-blue-300 transition-all">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-blue-600 mb-2">BASIC</h3>
            <div className="flex items-baseline mb-4">
              <span className="text-5xl font-bold text-charcoal-900">₹1,499</span>
              <span className="text-charcoal-600 ml-2">/month</span>
            </div>
            <p className="text-sm text-charcoal-600">For growing businesses</p>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <span className="text-charcoal-700"><strong>10 campaigns</strong> per month</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <span className="text-charcoal-700">Templates library (50+)</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <span className="text-charcoal-700">Instant Lead Ads</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <span className="text-charcoal-700">Leads dashboard</span>
            </li>
            <li className="flex items-start gap-2">
              <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-400">No AI Agent</span>
            </li>
          </ul>

          <a
            href="https://app.jupho.io/sign-up"
            className="block w-full text-center bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Start Basic
          </a>
        </div>

        {/* GROWTH Plan - RECOMMENDED */}
        <div className="bg-gradient-to-br from-coral-50 to-orange-50 rounded-2xl p-8 shadow-xl border-2 border-coral-400 hover:border-coral-500 transition-all relative">
          <div className="absolute -top-3 right-6 bg-coral-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            RECOMMENDED
          </div>
          
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-bold text-coral-600">GROWTH</h3>
              <Sparkles className="w-6 h-6 text-coral-600" />
            </div>
            <div className="flex items-baseline mb-4">
              <span className="text-5xl font-bold text-charcoal-900">₹1,999</span>
              <span className="text-charcoal-600 ml-2">/month</span>
            </div>
            <p className="text-sm text-coral-600 font-medium">AI-powered + everything in Basic</p>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-coral-500 flex-shrink-0 mt-0.5" />
              <span className="text-charcoal-700"><strong>25 campaigns</strong> per month</span>
            </li>
            <li className="flex items-start gap-2">
              <Zap className="w-5 h-5 text-coral-500 flex-shrink-0 mt-0.5" />
              <span className="text-charcoal-700"><strong>AI Agent</strong> (smart creation)</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-coral-500 flex-shrink-0 mt-0.5" />
              <span className="text-charcoal-700">AI-generated copy + strategy</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-coral-500 flex-shrink-0 mt-0.5" />
              <span className="text-charcoal-700">Everything in BASIC</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-coral-500 flex-shrink-0 mt-0.5" />
              <span className="text-charcoal-700">Priority support</span>
            </li>
          </ul>

          <a
            href="https://app.jupho.io/sign-up"
            className="block w-full text-center bg-coral-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-coral-600 transition-colors shadow-lg"
          >
            Start Growth
          </a>
        </div>
      </div>

      <div className="text-center mt-12">
        <p className="text-charcoal-600">
          All plans include direct Facebook integration · Cancel anytime · No hidden fees
        </p>
      </div>
    </section>
  );
}
