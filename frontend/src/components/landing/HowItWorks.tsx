import { MessageSquare, Sparkles, Rocket } from 'lucide-react';

export default function HowItWorks() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gray-50">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-charcoal-900 mb-4 tracking-tight">
          How It Works
        </h2>
        <p className="text-xl text-charcoal-600 max-w-2xl mx-auto">
          Create professional Meta ads in 3 simple steps
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Step 1 */}
        <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow relative">
          <div className="absolute -top-4 left-8 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
            1
          </div>
          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 mt-4">
            <MessageSquare className="w-7 h-7 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-charcoal-900 mb-3">
            Tell Us About Your Business
          </h3>
          <p className="text-charcoal-600 leading-relaxed">
            Answer a few simple questions about what you sell, who you serve, and your business goals. No technical jargon.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow relative">
          <div className="absolute -top-4 left-8 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
            2
          </div>
          <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 mt-4">
            <Sparkles className="w-7 h-7 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-charcoal-900 mb-3">
            AI Creates Your Ad
          </h3>
          <p className="text-charcoal-600 leading-relaxed">
            Our AI generates 3 copy variants, headlines, and targeting strategy. Pick your favorite or customize it further.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow relative">
          <div className="absolute -top-4 left-8 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
            3
          </div>
          <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6 mt-4">
            <Rocket className="w-7 h-7 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-charcoal-900 mb-3">
            Launch in Minutes
          </h3>
          <p className="text-charcoal-600 leading-relaxed">
            Connect your Facebook account and publish directly to Meta. Your ad goes live instantly—no manual setup needed.
          </p>
        </div>
      </div>
    </section>
  );
}
