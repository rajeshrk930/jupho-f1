import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-5xl lg:text-6xl font-bold text-charcoal-900 mb-6 leading-tight">
          Create High-Performing
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral-600 to-mint-600"> Meta Ads </span>
          with AI
        </h1>
        <p className="text-xl text-charcoal-700 mb-8 leading-relaxed">
          Let AI build your Meta ads automatically. No creative skills needed. 
          Just tell us about your business and get professional ads in minutes.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/sign-up"
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-coral-600 to-mint-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-2xl transition-all duration-200 hover:-translate-y-1"
          >
            Start Creating Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#features"
            className="inline-flex items-center gap-2 bg-white border-2 border-gray-300 text-charcoal-700 px-8 py-4 rounded-lg font-semibold text-lg hover:border-coral-600 hover:text-coral-600 transition-all"
          >
            See How It Works
          </a>
        </div>
        <p className="mt-6 text-sm text-charcoal-600">
          <CheckCircle2 className="w-4 h-4 inline text-mint-600" /> No credit card required
          <span className="mx-2">·</span>
          <CheckCircle2 className="w-4 h-4 inline text-mint-600" /> Free plan available
        </p>
      </div>
    </section>
  );
}
