import { Sparkles, Target, Zap } from 'lucide-react';

export default function Features() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-charcoal-900 mb-4 tracking-tight">
          Why Business Owners Love Jupho
        </h2>
        <p className="text-xl text-charcoal-600 max-w-2xl mx-auto">
          Stop wasting time on complicated ad tools. Let AI do the heavy lifting.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Feature 1 */}
        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
          <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
            <Sparkles className="w-7 h-7 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-charcoal-900 mb-3">
            AI-Powered Creation
          </h3>
          <p className="text-charcoal-600 leading-relaxed">
            Tell us about your business in plain English. Our AI generates professional ad copy, 
            headlines, and descriptions optimized for Meta.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
          <div className="w-14 h-14 bg-mint-100 rounded-xl flex items-center justify-center mb-6">
            <Target className="w-7 h-7 text-mint-600" />
          </div>
          <h3 className="text-2xl font-bold text-charcoal-900 mb-3">
            Direct Facebook Integration
          </h3>
          <p className="text-charcoal-600 leading-relaxed">
            Connect your Facebook Ad Account once. Create and publish ads directly to Meta 
            without leaving the platform.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
          <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
            <Zap className="w-7 h-7 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-charcoal-900 mb-3">
            Launch in Minutes
          </h3>
          <p className="text-charcoal-600 leading-relaxed">
            No design skills required. No copywriting experience needed. 
            Just answer a few questions and get ads ready to launch.
          </p>
        </div>
      </div>
    </section>
  );
}
