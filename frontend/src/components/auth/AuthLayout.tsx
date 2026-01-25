import { CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-mint-50 via-white to-coral-50">
      {/* Single Unified Card */}
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row min-h-[650px]">
          
          {/* Left Side - Product Showcase (Hidden on mobile) */}
          <div className="hidden md:flex md:w-[45%] bg-gradient-to-br from-gray-50 to-white p-10 flex-col justify-between border-r border-gray-100">
            {/* Logo */}
            <div>
              <Link href="/" className="inline-block mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-coral-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900 tracking-tight">Jupho</span>
                </div>
              </Link>

              {/* Headline */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight leading-tight">
                  AI-Powered Meta Ads in Minutes
                </h1>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Stop struggling with ad creation. Let AI build high-performing Meta ads automatically.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-mint-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="text-gray-700 text-sm">Easy Integration With all Platform such as Zoho, Shopify & etc.</p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-mint-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="text-gray-700 text-sm">Targeted Campaigns to Deliver Personalized Offers.</p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-mint-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="text-gray-700 text-sm">No Setup Cost for WhatsApp Business API.</p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-mint-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="text-gray-700 text-sm">Get Assistance for Applying Green Tick on WhatsApp.</p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-mint-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="text-gray-700 text-sm">24*7 Tech Support in a Click.</p>
                </div>
              </div>
            </div>

            {/* Bottom Section - Badges & Trust */}
            <div>
              {/* Trust Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm">
                  <span className="text-coral-500">★</span> High Performer
                </div>
                <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm">
                  <span className="text-coral-500">★</span> Best Support
                </div>
                <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm">
                  <span className="text-coral-500">★</span> Best ROI
                </div>
              </div>
              
              <p className="text-gray-900 text-sm font-semibold">
                Trusted by 5000+ Companiess
              </p>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="flex-1 flex items-center justify-center p-8 md:p-12 bg-white">
            <div className="w-full max-w-md">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
