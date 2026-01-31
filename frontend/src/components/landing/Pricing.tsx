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
              <span className="text-charcoal-700">Google Sheets auto-sync</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <span className="text-charcoal-700">Lead management dashboard</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <span className="text-charcoal-700">Performance analytics</span>
            </li>
            <li className="flex items-start gap-2">
              <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-400">No AI Agent or Webhooks</span>
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
        <div className="relative rounded-2xl p-8 shadow-xl overflow-hidden group">
          {/* Solid purple gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700" />
          
          {/* Animated accent blob */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 group-hover:opacity-40 transition-opacity" />
          
          {/* Badge */}
          <div className="absolute -top-3 right-6 bg-emerald-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            RECOMMENDED
          </div>
          
          <div className="relative mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-bold text-white">GROWTH</h3>
              <Sparkles className="w-6 h-6 text-cyan-300" />
            </div>
            <div className="flex items-baseline mb-4">
              <span className="text-5xl font-bold text-white">₹1,999</span>
              <span className="text-white/90 ml-2 font-medium">/month</span>
            </div>
            <p className="text-base text-white/95 font-semibold">AI-powered + everything in Basic</p>
          </div>

          <ul className="relative space-y-3 mb-8">
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
              <span className="text-white"><strong>25 campaigns</strong> per month</span>
            </li>
            <li className="flex items-start gap-2">
              <Zap className="w-5 h-5 text-cyan-300 flex-shrink-0 mt-0.5" />
              <span className="text-white"><strong>AI Agent</strong> (smart creation)</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
              <span className="text-white"><strong>Webhooks</strong> (5,000+ apps)</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
              <span className="text-white">Google Sheets auto-sync</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
              <span className="text-white">Templates + Lead management</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
              <span className="text-white">Performance analytics</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
              <span className="text-white">Priority support</span>
            </li>
          </ul>

          <a
            href="https://app.jupho.io/sign-up"
            className="relative block w-full text-center bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-50 transition-all hover:-translate-y-1 shadow-xl"
          >
            Start Growth
          </a>
        </div>
      </div>

      <div className="text-center mt-12 mb-16">
        <p className="text-charcoal-600">
          All plans include direct Facebook integration · Cancel anytime · No hidden fees
        </p>
      </div>

      {/* Feature Comparison Table */}
      <div className="mt-20">
        <h3 className="text-3xl font-bold text-charcoal-900 text-center mb-8">
          Compare All Features
        </h3>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-purple-50 to-blue-50">
                  <th className="text-left py-4 px-6 text-charcoal-900 font-bold">Feature</th>
                  <th className="text-center py-4 px-6 text-charcoal-900 font-bold">FREE</th>
                  <th className="text-center py-4 px-6 text-blue-600 font-bold">BASIC</th>
                  <th className="text-center py-4 px-6 text-purple-600 font-bold">GROWTH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-charcoal-700 font-medium">Campaigns per month</td>
                  <td className="text-center py-4 px-6 text-charcoal-700">2</td>
                  <td className="text-center py-4 px-6 text-charcoal-700">10</td>
                  <td className="text-center py-4 px-6 text-charcoal-700 font-semibold">25</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-charcoal-700 font-medium">Templates library (50+)</td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="w-5 h-5 text-blue-500 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="w-5 h-5 text-purple-600 inline" />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-charcoal-700 font-medium">Lead management dashboard</td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="w-5 h-5 text-blue-500 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="w-5 h-5 text-purple-600 inline" />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors bg-green-50">
                  <td className="py-4 px-6 text-charcoal-700 font-medium">
                    Google Sheets auto-sync
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">NEW</span>
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="w-5 h-5 text-blue-500 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="w-5 h-5 text-purple-600 inline" />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-charcoal-700 font-medium">Performance analytics</td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="w-5 h-5 text-blue-500 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="w-5 h-5 text-purple-600 inline" />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-charcoal-700 font-medium">AI Agent (smart creation)</td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="w-5 h-5 text-purple-600 inline" />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors bg-blue-50">
                  <td className="py-4 px-6 text-charcoal-700 font-medium">
                    Webhooks (5,000+ apps)
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">NEW</span>
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="w-5 h-5 text-purple-600 inline" />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-charcoal-700 font-medium">Priority support</td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="w-5 h-5 text-purple-600 inline" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
