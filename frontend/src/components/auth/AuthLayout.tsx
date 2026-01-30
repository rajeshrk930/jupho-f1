import { CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-mint-50 via-white to-purple-50">
      {/* Mobile: Just centered form without card wrapper */}
      <div className="md:hidden w-full max-w-md">
        {children}
      </div>

      {/* Desktop: Unified Card with left content + right form */}
      <div className="hidden md:block w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-row min-h-[650px]">
          
          {/* Left Side - Product Showcase */}
          <div className="w-[45%] bg-gradient-to-br from-gray-50 to-white p-10 flex flex-col justify-between border-r border-gray-100">
            {/* Logo */}
            <div>
              <Link href="/" className="inline-block mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900 tracking-tight">Jupho</span>
                </div>
              </Link>

              {/* Headline */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight leading-tight">
                  Launch High-Converting Meta Ads — Without an Agency
                </h1>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Create, launch, and manage Meta lead ads using proven templates or AI-powered workflows.
                  Built for founders, marketers, and local businesses.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-mint-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="text-gray-700 text-sm">Ready-made Meta ad templates tested across industries</p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-mint-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="text-gray-700 text-sm">Launch lead ads in minutes — no technical setup</p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-mint-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="text-gray-700 text-sm">AI-assisted campaign creation (Growth plan)</p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-mint-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="text-gray-700 text-sm">Works with Meta Instant Forms & WhatsApp leads</p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-mint-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="text-gray-700 text-sm">Clear limits. No hidden costs. No agency lock-in.</p>
                </div>
              </div>
            </div>

            {/* Bottom Section - Badges & Trust */}
            <div>
              {/* Trust Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm">
                  <span className="text-purple-500">⭐</span> Faster than agencies
                </div>
                <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm">
                  <span className="text-purple-500">⭐</span> Lower cost than freelancers
                </div>
                <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm">
                  <span className="text-purple-500">⭐</span> Built for performance
                </div>
              </div>
              
              <p className="text-gray-600 text-sm">
                Used by early founders & marketers across India
              </p>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="flex-1 flex items-center justify-center p-12 bg-white">
            <div className="w-full max-w-md">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
