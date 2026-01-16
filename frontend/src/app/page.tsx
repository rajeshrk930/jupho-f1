import Link from 'next/link';
import { Sparkles, Target, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-coral-50 to-mint-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-coral-600" />
            <span className="text-2xl font-bold text-charcoal-900">Jupho</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://app.jupho.io/sign-in"
              className="text-charcoal-700 hover:text-coral-600 font-medium transition-colors"
            >
              Sign In
            </a>
            <a
              href="https://app.jupho.io/sign-up"
              className="bg-coral-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-coral-700 transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
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
              href="https://app.jupho.io/sign-up"
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

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-charcoal-900 mb-4">
            Why Business Owners Love Jupho
          </h2>
          <p className="text-xl text-charcoal-600 max-w-2xl mx-auto">
            Stop wasting time on complicated ad tools. Let AI do the heavy lifting.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
            <div className="w-14 h-14 bg-coral-100 rounded-xl flex items-center justify-center mb-6">
              <Sparkles className="w-7 h-7 text-coral-600" />
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

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-coral-600 to-mint-600 rounded-3xl p-12 lg:p-16 text-center shadow-2xl">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Create Your First AI-Powered Ad?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join business owners who are already creating high-performing Meta ads with AI.
          </p>
          <a
            href="https://app.jupho.io/sign-up"
            className="inline-flex items-center gap-2 bg-white text-coral-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-2xl transition-all duration-200 hover:-translate-y-1"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </a>
          <p className="mt-4 text-white/80 text-sm">
            No credit card required · Start creating in 60 seconds
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-coral-600" />
              <span className="text-lg font-bold text-charcoal-900">Jupho</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-charcoal-600 hover:text-coral-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-charcoal-600 hover:text-coral-600 transition-colors">
                Terms of Service
              </Link>
            </div>
            <p className="text-sm text-charcoal-600">
              © 2026 Jupho · AI-powered Meta ads for business owners
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
