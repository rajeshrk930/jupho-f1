import { CheckCircle2, Sparkles, Target, Zap } from 'lucide-react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Product Showcase (Hidden on mobile) */}
      <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-coral-600 via-coral-500 to-mint-600 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <Link href="/" className="inline-block mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-coral-600" />
              </div>
              <span className="text-3xl font-bold text-white tracking-tight">Jupho</span>
            </div>
          </Link>

          {/* Headline */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight leading-tight">
              AI-Powered Meta Ads in Minutes
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Stop struggling with ad creation. Let AI build high-performing Meta ads automatically.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">AI Agent Creates Complete Campaigns</p>
                <p className="text-white/80 text-sm">From strategy to launch in one conversation</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">Professional Copy Generated</p>
                <p className="text-white/80 text-sm">Headlines, descriptions & CTAs optimized for conversions</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">Direct Facebook Integration</p>
                <p className="text-white/80 text-sm">Launch ads directly to your account</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Signals */}
        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-5 h-5 text-white" />
                  <span className="text-2xl font-bold text-white">2-25</span>
                </div>
                <p className="text-white/80 text-sm">campaigns/month</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-5 h-5 text-white" />
                  <span className="text-2xl font-bold text-white">3 Plans</span>
                </div>
                <p className="text-white/80 text-sm">FREE to GROWTH</p>
              </div>
            </div>
          </div>
          
          <p className="text-white/60 text-sm mt-6 text-center">
            Join hundreds of businesses creating better Meta ads
          </p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
